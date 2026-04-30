import { Effect } from "effect";
import type { Context } from "hono";
import { Hono } from "hono";
import { defineRoute, type WorkerBindings } from "../../platform/effect-handler.ts";
import type { RouteModule } from "../../platform/route-types.ts";

const aboutHandler = (_c: Context<{ Bindings: WorkerBindings }>) =>
	Effect.gen(function* () {
		const body = yield* Effect.succeed({
			name: "template-BPE" as const,
			description: "Effect-TS + Hono + Astro monorepo template" as const,
		});
		return new Response(JSON.stringify(body), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	});

const app = new Hono<{ Bindings: WorkerBindings }>().get(
	"/about",
	defineRoute({
		handler: aboutHandler,
	}),
);

const testApp = new Hono<{ Bindings: WorkerBindings }>().get(
	"/about",
	defineRoute({
		handler: aboutHandler,
	}),
);

export const aboutRoute = { app, testApp } satisfies RouteModule<typeof app>;
