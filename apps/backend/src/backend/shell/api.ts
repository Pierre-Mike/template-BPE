import type { ParseError } from "@effect/schema/ParseResult";
import { Effect } from "effect";
import { Hono } from "hono";
import { getVersion } from "../core/version.ts";
import { ConfigService, makeConfigLayer } from "../infra/config.ts";
import { routeEffect } from "./effect-handler.ts";

const versionHandler = routeEffect<ConfigService, ParseError>()
	.provide((c) => makeConfigLayer(c.env))
	.handle((c) =>
		Effect.gen(function* () {
			const config = yield* ConfigService;
			const raw = yield* config.get();
			const version = yield* getVersion(raw);
			return c.json(version, 200);
		}),
	);

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.get("/health", (c) => {
		return c.json({ status: "ok" as const, timestamp: Date.now() }, 200);
	})
	.get("/version", versionHandler);

export type AppType = typeof app;
export default app;
