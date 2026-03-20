/**
 * @template-bpe/api-contract
 *
 * Plain TypeScript route types for all backend routes.
 * Zero runtime dependencies — no Effect, no @effect/schema.
 * Consumers (Astro frontend, tests) import this package for the typed client.
 */
import type { ClientRequestOptions, ClientResponse } from "hono/client";
import { hc } from "hono/client";

// ---------------------------------------------------------------------------
// Route response shapes (pure TS — no Effect deps)
// ---------------------------------------------------------------------------

export type HealthRouteResponse = { status: "ok"; timestamp: number };
export type VersionRouteResponse = { version: string; env: string };

// ---------------------------------------------------------------------------
// ApiContract — aggregated interface for all current backend routes
// ---------------------------------------------------------------------------

export interface ApiContract {
	health: {
		$get: (
			args?: Record<string, never>,
			options?: ClientRequestOptions,
		) => Promise<ClientResponse<HealthRouteResponse, 200, "json">>;
	};
	version: {
		$get: (
			args?: Record<string, never>,
			options?: ClientRequestOptions,
		) => Promise<ClientResponse<VersionRouteResponse, 200, "json">>;
	};
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Returns a fully-typed Hono client cast through `ApiContract`.
 * The cast is safe because the backend routes structurally satisfy the interface.
 */
export function createBackendClient(baseUrl: string): ApiContract {
	return hc(baseUrl) as unknown as ApiContract;
}
