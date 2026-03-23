import { Hono } from "hono";
import { versionRoute } from "./routes/version.ts";

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.get("/health", (c) => c.json({ status: "ok" as const, timestamp: Date.now() }, 200))
	.route("/", versionRoute.app);

export type AppType = typeof app;
export default app;
