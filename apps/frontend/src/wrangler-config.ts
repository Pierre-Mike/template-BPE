/**
 * Documents the expected wrangler [env.*.vars] values for the frontend.
 * The actual values live in wrangler.toml; this module re-exports them
 * as typed constants so tests can assert against a single source of truth.
 *
 * Note: No root [vars] PUBLIC_API_URL — dev mode relies on the localhost
 * fallback in Astro pages. Only per-environment vars are set.
 */
export const STAGING_BACKEND_WORKER_URL =
	"https://staging-template-bpe-backend.workers.dev" as const;
export const PRODUCTION_BACKEND_WORKER_URL = "https://template-bpe-backend.workers.dev" as const;
