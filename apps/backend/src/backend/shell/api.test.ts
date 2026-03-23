import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { Hono } from "hono";
import app from "./api.ts";
import { routeEffect } from "./effect-handler.ts";

// RED → GREEN: shell/api.ts must never call Effect.runPromise directly.
// Effect lifecycle is owned by effect-handler.ts; api.ts only composes routes.
describe("boundary invariant: no raw Effect.runPromise in api.ts", () => {
	it("shell/api.ts does not contain Effect.runPromise(", async () => {
		const source = await Bun.file(new URL("./api.ts", import.meta.url)).text();
		expect(source).not.toContain("Effect.runPromise(");
	});
});

describe("GET /version", () => {
	it("returns 200 with version shape", async () => {
		const res = await app.request("/version", {}, { ENVIRONMENT: "test" });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ version: "0.0.0", env: "test" });
	});
});

describe("GET /health", () => {
	it("returns 200 with ok status", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toMatchObject({ status: "ok" });
	});
});

describe("HTTP boundary error handling", () => {
	it("returns 500 when the Effect fails", async () => {
		const failingHandler = routeEffect<never, Error>().handle(() => Effect.fail(new Error("boom")));
		const testApp = new Hono().get("/fail", failingHandler);
		const res = await testApp.request("/fail");
		expect(res.status).toBe(500);
		const body = await res.json();
		expect(body).toEqual({ error: "Internal Server Error" });
	});

	it("returns custom response shape when .onError() is configured", async () => {
		const failingHandler = routeEffect<never, Error>()
			.onError((err, c) => c.json({ message: err.message }, 422))
			.handle(() => Effect.fail(new Error("custom")));
		const testApp = new Hono().get("/fail", failingHandler);
		const res = await testApp.request("/fail");
		expect(res.status).toBe(422);
		const body = await res.json();
		expect(body).toEqual({ message: "custom" });
	});
});
