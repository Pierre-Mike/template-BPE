import { env } from "cloudflare:workers";
import { createBackendClient } from "@template-bpe/api-contract";

export { createBackendClient };

const apiBase = env.PUBLIC_API_URL ?? "http://localhost:8787";
export const api = createBackendClient(apiBase);
