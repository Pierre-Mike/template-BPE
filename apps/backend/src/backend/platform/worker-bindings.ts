import type { D1Database } from "./d1-types.ts";

/**
 * Cloudflare Workers environment bindings shared across all Hono route apps.
 *
 * Extracted here (rather than inside effect-handler.ts) so that
 * effect-handler.ts remains free of infra/ imports — a boundary enforced by
 * dependency-cruiser (no-effect-handler-to-core-or-infra).
 */
export type WorkerBindings = { ENVIRONMENT?: string; DB: D1Database };
