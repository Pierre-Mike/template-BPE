/**
 * Structural invariants for @template-bpe/api-contract.
 *
 * Pure functions that encode the repo-level rules enforced by CI.
 * Consumed by invariants.test.ts (local) and mirrored in .github/workflows/ci.yml.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** Returns true if packages/api-contract/package.json has no "dependencies" key. */
export function hasNoRuntimeDeps(pkgJsonPath: string): boolean {
	const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as Record<string, unknown>;
	return !("dependencies" in pkg);
}

/** Recursively collect .ts/.tsx files under dir, excluding node_modules. */
export function collectTsFiles(dir: string): string[] {
	const results: string[] = [];
	for (const entry of readdirSync(dir)) {
		if (entry === "node_modules") continue;
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			results.push(...collectTsFiles(full));
		} else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
			results.push(full);
		}
	}
	return results;
}

/** Returns paths (relative to repoRoot) of files containing "as unknown as". */
export function findCastViolations(dir: string, repoRoot: string): readonly string[] {
	return collectTsFiles(dir)
		.filter((file) => readFileSync(file, "utf-8").includes("as unknown as"))
		.map((file) => file.replace(repoRoot, ""));
}
