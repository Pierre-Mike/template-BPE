/**
 * Hono API routes — shell layer.
 * Orchestrates core (pure) + infra (services) via Effect pipelines.
 * Exports AppType for end-to-end type safety with hono/client.
 */
import { Hono } from "hono";

const app = new Hono().get("/health", (c) => {
	return c.json({ status: "ok" as const, timestamp: Date.now() });
});

export type AppType = typeof app;
export default app;
