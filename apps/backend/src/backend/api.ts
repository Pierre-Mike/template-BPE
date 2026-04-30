import { Hono } from "hono";
import { aboutRoute } from "./shell/routes/about.ts";
import { healthRoute } from "./shell/routes/health.ts";
import { notesRoute } from "./shell/routes/notes-routes.ts";
import { versionRoute } from "./shell/routes/version.ts";

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.route("/", aboutRoute.app)
	.route("/", healthRoute.app)
	.route("/", versionRoute.app)
	.route("/", notesRoute.app);

export type AppType = typeof app;
export default app;
