import { Effect, Either, Layer } from "effect";
import type { Context as HonoContext } from "hono";

export type WorkerBindings = { ENVIRONMENT?: string };

type HonoCtx = HonoContext<{ Bindings: WorkerBindings }>;

export interface RouteEffect<R, E> {
	provide<R2 extends R>(factory: (c: HonoCtx) => Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E>;

	provideStatic<R2 extends R>(layer: Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E>;

	onError(strategy: (error: E, c: HonoCtx) => Response): RouteEffect<R, E>;

	/**
	 * Terminal method — only callable when R = never (all deps provided).
	 * The fn may reference services; accumulated layers satisfy them at runtime.
	 */
	handle<Deps>(
		this: RouteEffect<never, E>,
		fn: (c: HonoCtx) => Effect.Effect<Response, E, Deps>,
	): (c: HonoCtx) => Promise<Response>;
}

class RouteEffectImpl<R, E> implements RouteEffect<R, E> {
	// biome-ignore lint/suspicious/noExplicitAny: layer types erased at runtime
	private _factories: Array<(c: HonoCtx) => Layer.Layer<any>> = [];
	// biome-ignore lint/suspicious/noExplicitAny: layer types erased at runtime
	private _static: Array<Layer.Layer<any>> = [];
	private _onError: ((error: E, c: HonoCtx) => Response) | null = null;

	private clone(): RouteEffectImpl<R, E> {
		const next = new RouteEffectImpl<R, E>();
		next._factories = [...this._factories];
		next._static = [...this._static];
		next._onError = this._onError;
		return next;
	}

	provide<R2 extends R>(factory: (c: HonoCtx) => Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E> {
		// biome-ignore lint/suspicious/noExplicitAny: narrowing R via cast
		const next = this.clone() as unknown as RouteEffectImpl<Exclude<R, R2>, E>;
		// biome-ignore lint/suspicious/noExplicitAny: layer types erased at runtime
		next._factories = [...this._factories, factory as (c: HonoCtx) => Layer.Layer<any>];
		return next;
	}

	provideStatic<R2 extends R>(layer: Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E> {
		// biome-ignore lint/suspicious/noExplicitAny: narrowing R via cast
		const next = this.clone() as unknown as RouteEffectImpl<Exclude<R, R2>, E>;
		// biome-ignore lint/suspicious/noExplicitAny: layer types erased at runtime
		next._static = [...this._static, layer as Layer.Layer<any>];
		return next;
	}

	onError(strategy: (error: E, c: HonoCtx) => Response): RouteEffect<R, E> {
		const next = this.clone();
		next._onError = strategy;
		return next;
	}

	handle<Deps>(
		this: RouteEffectImpl<never, E>,
		fn: (c: HonoCtx) => Effect.Effect<Response, E, Deps>,
	): (c: HonoCtx) => Promise<Response> {
		const factories = this._factories;
		const staticLayers = this._static;
		const errorHandler = this._onError;

		return async (c: HonoCtx): Promise<Response> => {
			// biome-ignore lint/suspicious/noExplicitAny: merging heterogeneous layers
			const allLayers = [...staticLayers, ...factories.map((f) => f(c))] as Layer.Layer<any>[];

			// biome-ignore lint/suspicious/noExplicitAny: layer types erased at runtime; cast is safe because accumulated layers satisfy Deps
			const combined = (
				allLayers.length === 0 ? Layer.empty : allLayers.reduce((acc, l) => Layer.merge(acc, l))
			) as Layer.Layer<Deps>;

			const program = Effect.either(fn(c).pipe(Effect.provide(combined)));

			const result = await Effect.runPromise(program);

			if (Either.isRight(result)) {
				return result.right;
			}

			const error = result.left;
			if (errorHandler) {
				return errorHandler(error, c);
			}
			return new Response(JSON.stringify({ error: String(error) }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		};
	}
}

export function routeEffect<R, E = never>(): RouteEffect<R, E> {
	return new RouteEffectImpl<R, E>();
}
