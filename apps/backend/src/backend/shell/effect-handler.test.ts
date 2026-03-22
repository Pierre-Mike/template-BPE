import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { Hono } from "hono";
import { ConfigService, ConfigTest, makeConfigLayer } from "../infra/config.ts";
import { routeEffect } from "./effect-handler.ts";

describe("routeEffect", () => {
	describe("provide + handle", () => {
		it("runs the effect and returns the response", async () => {
			const handler = routeEffect<ConfigService>()
				.provide(() => ConfigTest)
				.handle((c) =>
					Effect.gen(function* () {
						const svc = yield* ConfigService;
						const data = yield* svc.get();
						return c.json(data, 200);
					}),
				);

			const testApp = new Hono().get("/test", handler);
			const res = await testApp.request("/test");
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toEqual({ version: "0.0.0", env: "test" });
		});

		it("forwards c.env to the per-request factory", async () => {
			const handler = routeEffect<ConfigService>()
				.provide((c) => makeConfigLayer(c.env as { ENVIRONMENT?: string }))
				.handle((c) =>
					Effect.gen(function* () {
						const svc = yield* ConfigService;
						const data = yield* svc.get();
						return c.json(data, 200);
					}),
				);

			const testApp = new Hono<{ Bindings: { ENVIRONMENT?: string } }>().get("/test", handler);
			const res = await testApp.request("/test", {}, { ENVIRONMENT: "staging" });
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toEqual({ version: "0.0.0", env: "staging" });
		});
	});

	describe("provideStatic", () => {
		it("accepts a static layer and runs the effect", async () => {
			const handler = routeEffect<ConfigService>()
				.provideStatic(ConfigTest)
				.handle((c) =>
					Effect.gen(function* () {
						const svc = yield* ConfigService;
						const data = yield* svc.get();
						return c.json(data, 200);
					}),
				);

			const testApp = new Hono().get("/test", handler);
			const res = await testApp.request("/test");
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toEqual({ version: "0.0.0", env: "test" });
		});
	});

	describe("default error handling", () => {
		it("returns 500 JSON when the effect fails with a typed error", async () => {
			const handler = routeEffect<ConfigService, Error>()
				.provide(() => ConfigTest)
				.handle(() => Effect.fail(new Error("boom")));

			const testApp = new Hono().get("/test", handler);
			const res = await testApp.request("/test");
			expect(res.status).toBe(500);
			const body = await res.json();
			expect(body).toEqual({ error: "Internal Server Error" });
		});
	});

	describe("onError", () => {
		it("maps a typed error to a custom response", async () => {
			const handler = routeEffect<ConfigService, Error>()
				.provide(() => ConfigTest)
				.onError((err, c) => c.json({ message: err.message }, 422))
				.handle(() => Effect.fail(new Error("custom")));

			const testApp = new Hono().get("/test", handler);
			const res = await testApp.request("/test");
			expect(res.status).toBe(422);
			const body = await res.json();
			expect(body).toEqual({ message: "custom" });
		});
	});
});
