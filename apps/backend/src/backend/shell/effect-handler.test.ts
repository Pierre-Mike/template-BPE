import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import type { Context as HonoContext } from "hono";
import { routeEffect, type WorkerBindings } from "./effect-handler.ts";

type TestContext = HonoContext<{ Bindings: WorkerBindings }>;

const makeMockContext = (): TestContext =>
	({
		json: (data: unknown, status = 200) =>
			new Response(JSON.stringify(data), {
				status,
				headers: { "Content-Type": "application/json" },
			}),
		env: {},
	}) as unknown as TestContext;

describe("routeEffect", () => {
	it("returns the response on success", async () => {
		const handler = routeEffect<never>().handle(() =>
			Effect.succeed(new Response("ok", { status: 200 })),
		);
		const response = await handler(makeMockContext());
		expect(response.status).toBe(200);
	});

	it("returns 500 with default error body on typed failure", async () => {
		const handler = routeEffect<never, Error>().handle(() =>
			Effect.fail(new Error("something went wrong")),
		);
		const response = await handler(makeMockContext());
		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body).toEqual({ error: "Internal Server Error" });
	});

	it("uses custom onError strategy on typed failure", async () => {
		const handler = routeEffect<never, Error>()
			.onError((error, c) => c.json({ error: error.message }, 422) as Response)
			.handle(() => Effect.fail(new Error("bad input")));
		const response = await handler(makeMockContext());
		expect(response.status).toBe(422);
		const body = await response.json();
		expect(body).toEqual({ error: "bad input" });
	});
});
