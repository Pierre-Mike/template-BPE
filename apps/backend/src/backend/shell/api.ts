import { Hono } from "hono";
import { aboutRoute } from "./routes/about.ts";
import { healthRoute } from "./routes/health.ts";
import { notesRoute } from "./routes/notes-routes.ts";
import { versionRoute } from "./routes/version.ts";

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.route("/", aboutRoute.app)
	.route("/", healthRoute.app)
	.route("/", versionRoute.app)
	.route("/", notesRoute.app);

export type AppType = typeof app;
export default app;
