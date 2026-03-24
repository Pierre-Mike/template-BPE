import type { Hono } from "hono";
import type { WorkerBindings } from "../effect-handler.ts";

export type RouteModule<TApp extends Hono<{ Bindings: WorkerBindings }>> = {
	readonly app: TApp;
};
