/**
 * TDD: RED phase — test written before conformance.ts exists.
 *
 * Cycle 1: conformance module is importable (file exists, no runtime errors).
 *
 * The actual type-level enforcement (ClientType<AppType> extends ApiContract)
 * is a compile-time check validated by `tsc --noEmit` / `turbo typecheck`.
 */
import { describe, it } from "bun:test";

describe("conformance", () => {
	it("module is importable with no runtime errors", async () => {
		// RED: this import fails until conformance.ts exists.
		// GREEN: once conformance.ts is created the test passes.
		// The type assertion inside enforces contract conformance at compile time.
		await import("./conformance.ts");
	});
});
