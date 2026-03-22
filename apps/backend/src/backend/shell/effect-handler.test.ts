import { describe, expect, it } from "bun:test";
import { Context, Effect, Layer } from "effect";
import type { Context as HonoContext } from "hono";
import { routeEffect, type WorkerBindings } from "./effect-handler.ts";

const makeCtx = (env: WorkerBindings = {}): HonoContext<{ Bindings: WorkerBindings }> =>
	({ env }) as unknown as HonoContext<{ Bindings: WorkerBindings }>;

describe("routeEffect", () => {
	it("happy path: handler called, response returned", async () => {
		const handler = routeEffect<never>().handle(() =>
			Effect.succeed(new Response("ok", { status: 200 })),
		);
		const response = await handler(makeCtx());
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("ok");
	});

	it("default error: no onError → 500 JSON { error: string }", async () => {
		const handler = routeEffect<never, string>().handle(() => Effect.fail("something went wrong"));
		const response = await handler(makeCtx());
		expect(response.status).toBe(500);
		const body = (await response.json()) as { error: string };
		expect(typeof body.error).toBe("string");
	});

	it("error mapping: onError response is used on Effect failure", async () => {
		const handler = routeEffect<never, string>()
			.onError((error, _c) => new Response(`custom: ${error}`, { status: 422 }))
			.handle(() => Effect.fail("oops"));
		const response = await handler(makeCtx());
		expect(response.status).toBe(422);
		expect(await response.text()).toBe("custom: oops");
	});

	it(".provide() accumulates layers from Hono context", async () => {
		interface TestService {
			value: string;
		}
		const TestService = Context.GenericTag<TestService>("TestService");

		const handler = routeEffect<TestService>()
			.provide((c) => Layer.succeed(TestService, { value: c.env.ENVIRONMENT ?? "default" }))
			.handle(() =>
				Effect.gen(function* () {
					const svc = yield* TestService;
					return new Response(svc.value, { status: 200 });
				}),
			);

		const response = await handler(makeCtx({ ENVIRONMENT: "prod" }));
		expect(await response.text()).toBe("prod");
	});

	it(".provideStatic() accumulates static layers", async () => {
		interface StaticService {
			value: string;
		}
		const StaticService = Context.GenericTag<StaticService>("StaticService");

		const handler = routeEffect<StaticService>()
			.provideStatic(Layer.succeed(StaticService, { value: "static" }))
			.handle(() =>
				Effect.gen(function* () {
					const svc = yield* StaticService;
					return new Response(svc.value, { status: 200 });
				}),
			);

		const response = await handler(makeCtx());
		expect(await response.text()).toBe("static");
	});
});
