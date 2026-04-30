import { Hono } from "hono";
import { notesRoute } from "./features/note/note.routes.ts";
import { aboutRoute } from "./shell/routes/about.ts";
import { healthRoute } from "./shell/routes/health.ts";
import { versionRoute } from "./shell/routes/version.ts";

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.route("/", aboutRoute.app)
	.route("/", healthRoute.app)
	.route("/", versionRoute.app)
	.route("/", notesRoute.app);

export type AppType = typeof app;
export default app;
