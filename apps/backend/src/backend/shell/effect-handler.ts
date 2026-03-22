import { Effect, Layer } from "effect";
import type { Context as HonoContext } from "hono";

export type WorkerBindings = { ENVIRONMENT?: string };

export interface RouteEffect<R, E> {
	provide<R2 extends R>(
		factory: (c: HonoContext<{ Bindings: WorkerBindings }>) => Layer.Layer<R2>,
	): RouteEffect<Exclude<R, R2>, E>;

	provideStatic<R2 extends R>(layer: Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E>;

	onError(strategy: (error: E, c: HonoContext) => Response): RouteEffect<R, E>;

	handle(
		this: RouteEffect<never, E>,
		fn: (c: HonoContext<{ Bindings: WorkerBindings }>) => Effect.Effect<Response, E, never>,
	): (c: HonoContext<{ Bindings: WorkerBindings }>) => Promise<Response>;
}

class RouteEffectBuilder<R, E> implements RouteEffect<R, E> {
	constructor(
		private readonly _layers: Array<
			(c: HonoContext<{ Bindings: WorkerBindings }>) => Layer.Layer<never>
		>,
		private readonly _errorStrategy: ((error: E, c: HonoContext) => Response) | undefined,
	) {}

	provide<R2 extends R>(
		factory: (c: HonoContext<{ Bindings: WorkerBindings }>) => Layer.Layer<R2>,
	): RouteEffect<Exclude<R, R2>, E> {
		return new RouteEffectBuilder<Exclude<R, R2>, E>(
			[
				...this._layers,
				factory as (c: HonoContext<{ Bindings: WorkerBindings }>) => Layer.Layer<never>,
			],
			this._errorStrategy,
		);
	}

	provideStatic<R2 extends R>(layer: Layer.Layer<R2>): RouteEffect<Exclude<R, R2>, E> {
		return this.provide(() => layer as unknown as Layer.Layer<R2>);
	}

	onError(strategy: (error: E, c: HonoContext) => Response): RouteEffect<R, E> {
		return new RouteEffectBuilder<R, E>(this._layers, strategy);
	}

	handle(
		this: RouteEffectBuilder<never, E>,
		fn: (c: HonoContext<{ Bindings: WorkerBindings }>) => Effect.Effect<Response, E, never>,
	): (c: HonoContext<{ Bindings: WorkerBindings }>) => Promise<Response> {
		const layers = this._layers;
		const errorStrategy = this._errorStrategy;

		return (c) => {
			const mergedLayer = layers.reduce<Layer.Layer<never>>(
				(acc, factory) => Layer.merge(acc, factory(c)),
				Layer.empty as Layer.Layer<never>,
			);

			return Effect.runPromise(
				fn(c).pipe(
					Effect.provide(mergedLayer),
					Effect.catchAll((error) =>
						Effect.succeed(
							errorStrategy
								? errorStrategy(error, c as unknown as HonoContext)
								: (c.json({ error: "Internal Server Error" }, 500) as unknown as Response),
						),
					),
				),
			);
		};
	}
}

export function routeEffect<R = never, E = never>(): RouteEffect<R, E> {
	return new RouteEffectBuilder<R, E>([], undefined);
}
