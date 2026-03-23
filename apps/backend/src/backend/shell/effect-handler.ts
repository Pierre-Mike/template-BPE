import { Cause, Effect, Exit, Layer, Option } from "effect";
import type { Context as HonoContext } from "hono";

export type WorkerBindings = { ENVIRONMENT?: string };

type AnyContext = HonoContext<{ Bindings: WorkerBindings }>;

type LayerEntry =
	| { readonly _tag: "factory"; readonly fn: (c: AnyContext) => Layer.Layer<never> }
	| { readonly _tag: "static"; readonly layer: Layer.Layer<never> };

export interface RouteEffect<R, E> {
	/**
	 * Phantom discriminant — makes R structurally load-bearing so the
	 * `this: RouteEffect<never, E>` constraint on `.handle()` is enforced.
	 */
	readonly _R: R;

	/** Provide a per-request layer factory that receives the Hono context. */
	provide<R2 extends R>(
		factory: (c: AnyContext) => Layer.Layer<R2>,
	): RouteEffect<Exclude<R, R2>, E>;

	/** Provide a static layer shared across all requests. */
	provideStatic<R2 extends R>(layer: Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E>;

	/** Set a custom error-to-Response mapper. Default: 500 `{ error: "Internal Server Error" }`. */
	onError(strategy: (error: E, c: AnyContext) => Response): RouteEffect<R, E>;

	/**
	 * Terminal method: produce a Hono-compatible handler.
	 * Only callable when R = never (all dependencies provided).
	 * Preserves A so Hono can infer typed response bodies for AppType.
	 */
	handle<R2, A>(
		this: RouteEffect<never, E>,
		fn: (c: AnyContext) => Effect.Effect<A, E, R2>,
	): (c: AnyContext) => Promise<A>;
}

class RouteEffectBuilder<R, E> implements RouteEffect<R, E> {
	/** @internal phantom — satisfies the interface; never accessed at runtime */
	declare readonly _R: R;

	constructor(
		private readonly _layers: readonly LayerEntry[],
		private readonly _onError: ((error: E, c: AnyContext) => Response) | undefined,
	) {}

	provide<R2 extends R>(
		factory: (c: AnyContext) => Layer.Layer<R2>,
	): RouteEffect<Exclude<R, R2>, E> {
		return new RouteEffectBuilder<Exclude<R, R2>, E>(
			[...this._layers, { _tag: "factory", fn: factory as (c: AnyContext) => Layer.Layer<never> }],
			this._onError,
		);
	}

	provideStatic<R2 extends R>(layer: Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E> {
		return new RouteEffectBuilder<Exclude<R, R2>, E>(
			[...this._layers, { _tag: "static", layer: layer as Layer.Layer<never> }],
			this._onError,
		);
	}

	onError(strategy: (error: E, c: AnyContext) => Response): RouteEffect<R, E> {
		return new RouteEffectBuilder<R, E>(this._layers, strategy);
	}

	handle<R2, A>(
		this: RouteEffectBuilder<never, E>,
		fn: (c: AnyContext) => Effect.Effect<A, E, R2>,
	): (c: AnyContext) => Promise<A> {
		const layers = this._layers;
		const errorHandler = this._onError;

		return async (c) => {
			const runtimeLayers = layers.map((entry) =>
				entry._tag === "factory" ? entry.fn(c) : entry.layer,
			);

			const combinedLayer = runtimeLayers.reduce<Layer.Layer<never>>(
				(acc, l) => Layer.merge(acc, l) as Layer.Layer<never>,
				Layer.empty as Layer.Layer<never>,
			);

			const exit = await Effect.runPromiseExit(
				(fn(c) as Effect.Effect<A, E, never>).pipe(Effect.provide(combinedLayer)),
			);

			if (Exit.isSuccess(exit)) {
				return exit.value;
			}

			if (errorHandler !== undefined) {
				const typedError = Option.getOrNull(Cause.failureOption(exit.cause));
				if (typedError !== null) {
					return errorHandler(typedError, c) as unknown as A;
				}
			}

			return new Response(JSON.stringify({ error: "Internal Server Error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}) as unknown as A;
		};
	}
}

export function routeEffect<R, E = never>(): RouteEffect<R, E> {
	return new RouteEffectBuilder<R, E>([], undefined);
}

/** defineRoute overload 1: no deps — R must be never, `deps` is forbidden */
export function defineRoute<R extends never, E = never, A = Response>(config: {
	deps?: never;
	onError?: (error: E, c: AnyContext) => Response;
	handler: (c: AnyContext) => Effect.Effect<A, E, R>;
}): (c: AnyContext) => Promise<A>;

/**
 * defineRoute overload 2: with deps — R is not never, `deps` is required.
 * The `[R] extends [never] ? never : Layer<R>` conditional makes `deps: never`
 * when R=never (even though overload 1 should win), ensuring both overloads
 * reject extra deps due to Layer<R>'s contravariance in ROut.
 */
export function defineRoute<R, E = never, A = Response>(config: {
	deps: [R] extends [never] ? never : ((c: AnyContext) => Layer.Layer<R>) | Layer.Layer<R>;
	onError?: (error: E, c: AnyContext) => Response;
	handler: (c: AnyContext) => Effect.Effect<A, E, R>;
}): (c: AnyContext) => Promise<A>;

export function defineRoute(config: {
	deps?: ((c: AnyContext) => Layer.Layer<never>) | Layer.Layer<never>;
	onError?: (error: never, c: AnyContext) => Response;
	handler: (c: AnyContext) => Effect.Effect<unknown, unknown, unknown>;
}): (c: AnyContext) => Promise<unknown> {
	let builder: RouteEffect<never, never>;

	if (config.deps === undefined) {
		builder = routeEffect<never>();
	} else if (typeof config.deps === "function") {
		builder = routeEffect<never>().provide(config.deps);
	} else {
		builder = routeEffect<never>().provideStatic(config.deps);
	}

	if (config.onError !== undefined) {
		builder = builder.onError(config.onError);
	}

	// Overload signatures guarantee R and E are resolved at call sites; cast to satisfy handle's constraint
	return builder.handle(config.handler as (c: AnyContext) => Effect.Effect<unknown, never, never>);
}
