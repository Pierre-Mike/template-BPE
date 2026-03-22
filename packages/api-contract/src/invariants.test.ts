/**
 * TDD: RED phase — structural invariants for @template-bpe/api-contract.
 *
 * Cycle 1: api-contract has zero runtime dependencies
 * Cycle 2: cast isolation — `as unknown as` never appears in apps/frontend/
 *
 * These tests encode the same checks that run in CI, making the invariants
 * machine-verified locally before a push.
 */
import { describe, expect, it } from "bun:test";
import { join, resolve } from "node:path";
import { findCastViolations, hasNoRuntimeDeps } from "./invariants";

const REPO_ROOT = resolve(import.meta.dir, "../../../");

// --- Cycle 1: api-contract has zero runtime dependencies ---
describe("api-contract: zero runtime dependencies", () => {
	it("packages/api-contract/package.json has no 'dependencies' key", () => {
		const pkgPath = join(REPO_ROOT, "packages/api-contract/package.json");
		expect(
			hasNoRuntimeDeps(pkgPath),
			"api-contract must not have a 'dependencies' key — use devDependencies only",
		).toBe(true);
	});
});

// --- Cycle 2: cast isolation — `as unknown as` only in api-contract/src/index.ts ---
describe("frontend: no `as unknown as` casts", () => {
	it("no file in apps/frontend/ contains `as unknown as`", () => {
		const frontendSrc = join(REPO_ROOT, "apps/frontend");
		const violations = findCastViolations(frontendSrc, REPO_ROOT);
		expect(
			violations,
			`Cast 'as unknown as' must only appear in packages/api-contract/src/index.ts, not in apps/frontend/. Found in: ${violations.join(", ")}`,
		).toEqual([]);
	});
});
