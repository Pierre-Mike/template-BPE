import type { ParseError } from "@effect/schema/ParseResult";
import { Effect } from "effect";
import type { Context } from "hono";
import { Hono } from "hono";
import { getVersion } from "../../core/version.ts";
import { ConfigService, ConfigTest, makeConfigLayer } from "../../infra/config.ts";
import { defineRoute, type WorkerBindings } from "../effect-handler.ts";
import type { RouteModule } from "./_types.ts";

const versionHandler = (c: Context<{ Bindings: WorkerBindings }>) =>
	Effect.gen(function* () {
		const config = yield* ConfigService;
		const raw = yield* config.get();
		const version = yield* getVersion(raw);
		return c.json(version, 200);
	});

const app = new Hono<{ Bindings: WorkerBindings }>().get(
	"/version",
	defineRoute<ConfigService, ParseError>({
		deps: (c) => makeConfigLayer(c.env),
		handler: versionHandler,
	}),
);

const testApp = new Hono<{ Bindings: WorkerBindings }>().get(
	"/version",
	defineRoute<ConfigService, ParseError>({
		deps: ConfigTest,
		handler: versionHandler,
	}),
);

export const versionRoute = { app, testApp } satisfies RouteModule<typeof app>;
