import { Effect, type Layer } from "effect";
import type { Context } from "hono";
import { Hono } from "hono";
import { getVersion } from "../../core/version.ts";
import { ConfigService, makeConfigLayer } from "../../infra/config.ts";
import { defineRoute, type WorkerBindings } from "../effect-handler.ts";
import type { RouteModule } from "./_types.ts";

type AnyContext = Context<{ Bindings: WorkerBindings }>;

const versionHandler = (c: AnyContext) =>
	Effect.gen(function* () {
		const config = yield* ConfigService;
		const raw = yield* config.get();
		const version = yield* getVersion(raw);
		return c.json(version, 200);
	});

export const buildVersionApp = (
	deps: Layer.Layer<ConfigService> | ((c: AnyContext) => Layer.Layer<ConfigService>),
) =>
	new Hono<{ Bindings: WorkerBindings }>().get(
		"/version",
		defineRoute({ deps, handler: versionHandler }),
	);

const app = buildVersionApp((c) => makeConfigLayer(c.env));

export const versionRoute = { app } satisfies RouteModule<typeof app>;
