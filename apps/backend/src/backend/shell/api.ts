import { Hono } from "hono";
import { healthRoute } from "./routes/health.ts";
import { notesRoute } from "./routes/notes-routes.ts";
import { versionRoute } from "./routes/version.ts";

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.route("/", healthRoute.app)
	.route("/", versionRoute.app)
	.route("/", notesRoute.app);

export type AppType = typeof app;
export default app;
