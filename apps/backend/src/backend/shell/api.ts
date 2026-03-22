import { Effect } from "effect";
import { Hono } from "hono";
import { getVersion } from "../core/version.ts";
import { ConfigService, makeConfigLayer } from "../infra/config.ts";

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.get("/health", (c) => {
		return c.json({ status: "ok" as const, timestamp: Date.now() }, 200);
	})
	.get("/version", async (c) => {
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const config = yield* ConfigService;
				const raw = yield* config.get();
				return yield* getVersion(raw);
			}).pipe(Effect.provide(makeConfigLayer(c.env))),
		);
		return c.json(result, 200);
	});

export type AppType = typeof app;
export default app;
