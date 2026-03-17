/**
 * Typed API client — imports route types from backend, zero codegen.
 * All routes are fully typed: params, query, request body, response.
 */
import type { AppType } from "@template-bpe/backend/types";
import { hc } from "hono/client";

const API_BASE = "http://localhost:8787";

export const api = hc<AppType>(API_BASE);

// Usage example (fully typed):
// const res = await api.health.$get();
// const data = await res.json(); // { status: "ok", timestamp: number }
