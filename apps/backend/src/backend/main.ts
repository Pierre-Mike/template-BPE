/**
 * Composition root — Cloudflare Workers entry point.
 * Provides live Layers, wires up the Hono app as the fetch handler.
 */
import app from "./shell/api.ts";

export default app;
