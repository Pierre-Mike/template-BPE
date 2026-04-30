import { Hono } from "hono";
import { aboutRoute } from "./features/about/about.routes.ts";
import { healthRoute } from "./features/health/health.routes.ts";
import { notesRoute } from "./features/note/note.routes.ts";
import { versionRoute } from "./features/version/version.routes.ts";

const app = new Hono<{ Bindings: { ENVIRONMENT?: string } }>()
	.route("/", aboutRoute.app)
	.route("/", healthRoute.app)
	.route("/", versionRoute.app)
	.route("/", notesRoute.app);

export type AppType = typeof app;
export default app;
