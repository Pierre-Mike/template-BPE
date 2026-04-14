/**
 * TDD: RED phase — tests written before implementation.
 */
import { describe, expect, it, mock } from "bun:test";

mock.module("cloudflare:workers", () => ({
	env: { PUBLIC_API_URL: "http://localhost:8787" },
}));

// --- Cycle 1: api.ts re-exports createBackendClient from @template-bpe/api-contract ---
describe("api re-export", () => {
	it("exports createBackendClient", async () => {
		const mod = await import("./api.ts");
		expect(typeof mod.createBackendClient).toBe("function");
	});

	// --- Cycle 2: the re-exported client has health and version routes ---
	it("createBackendClient returns client with health.$get and version.$get", async () => {
		const { createBackendClient } = await import("./api.ts");
		const client = createBackendClient("http://localhost:8787");
		expect(typeof client.health.$get).toBe("function");
		expect(typeof client.version.$get).toBe("function");
	});

	// --- Cycle 3: the typed client exposes notes routes ---
	it("createBackendClient returns client with notes routes", async () => {
		const { createBackendClient } = await import("./api.ts");
		const client = createBackendClient("http://localhost:8787");
		expect(typeof client.notes.$get).toBe("function");
		expect(typeof client.notes.$post).toBe("function");
		expect(typeof client.notes[":id"].$get).toBe("function");
	});

	// --- Cycle 4: pre-configured api client is exported ---
	it("exports a pre-configured api client", async () => {
		const { api } = await import("./api.ts");
		expect(api).toBeDefined();
		expect(typeof api.version.$get).toBe("function");
		expect(typeof api.notes.$get).toBe("function");
	});
});
