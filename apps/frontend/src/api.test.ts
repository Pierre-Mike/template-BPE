/**
 * TDD: RED phase — tests written before implementation.
 */
import { describe, expect, it } from "bun:test";

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
});
