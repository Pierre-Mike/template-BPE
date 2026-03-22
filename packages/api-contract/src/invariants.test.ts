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
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../../../");

// --- Cycle 1: api-contract has zero runtime dependencies ---
describe("api-contract: zero runtime dependencies", () => {
	it("packages/api-contract/package.json has no 'dependencies' key", () => {
		const pkgPath = join(REPO_ROOT, "packages/api-contract/package.json");
		const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
		expect(
			"dependencies" in pkg,
			"api-contract must not have a 'dependencies' key — use devDependencies only",
		).toBe(false);
	});
});

// --- Cycle 2: cast isolation — `as unknown as` only in api-contract/src/client.ts ---
describe("frontend: no `as unknown as` casts", () => {
	function collectTsFiles(dir: string): string[] {
		const results: string[] = [];
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) {
				results.push(...collectTsFiles(full));
			} else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
				results.push(full);
			}
		}
		return results;
	}

	it("no file in apps/frontend/ contains `as unknown as`", () => {
		const frontendSrc = join(REPO_ROOT, "apps/frontend");
		const files = collectTsFiles(frontendSrc);
		const violations: string[] = [];
		for (const file of files) {
			const content = readFileSync(file, "utf-8");
			if (content.includes("as unknown as")) {
				violations.push(file.replace(REPO_ROOT, ""));
			}
		}
		expect(
			violations,
			`Cast 'as unknown as' must only appear in packages/api-contract/src/client.ts, not in apps/frontend/. Found in: ${violations.join(", ")}`,
		).toEqual([]);
	});
});
