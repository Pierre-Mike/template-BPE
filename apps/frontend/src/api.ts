/**
 * Typed API client — imports route types from backend, zero codegen.
 * All routes are fully typed: params, query, request body, response.
 */
import type { ClientRequestOptions, ClientResponse } from "hono/client";
import { hc } from "hono/client";

/**
 * Minimal structural type mirroring the backend's Hono app routes.
 * Defined locally so the frontend does not depend on Effect-TS at type-check time.
 */
interface BackendClient {
	health: {
		$get: (
			args?: Record<string, never>,
			options?: ClientRequestOptions,
		) => Promise<ClientResponse<{ status: "ok"; timestamp: number }, 200, "json">>;
	};
	version: {
		$get: (
			args?: Record<string, never>,
			options?: ClientRequestOptions,
		) => Promise<ClientResponse<{ version: string; env: string }, 200, "json">>;
	};
}

// hc<AppType> resolves to `unknown` in the Astro LSP because @effect/schema is
// not a frontend dependency. We cast through the structural interface above which
// accurately mirrors the backend routes.
export function createApiClient(baseUrl: string): BackendClient {
	return hc(baseUrl) as unknown as BackendClient;
}
