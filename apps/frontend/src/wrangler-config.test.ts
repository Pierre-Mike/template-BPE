/**
 * TDD: RED phase — tests written before implementation.
 *
 * Acceptance criteria:
 * - apps/frontend/wrangler.toml contains a [vars] section with PUBLIC_API_URL set to the deployed backend Worker URL
 * - No changes to any Astro page files
 */

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BACKEND_WORKER_URL } from "./wrangler-config.ts";

const tomlPath = resolve(import.meta.dir, "../wrangler.toml");
const tomlContent = readFileSync(tomlPath, "utf-8");

describe("apps/frontend/wrangler.toml", () => {
	// Cycle 1: [vars] section exists
	it("contains a [vars] section", () => {
		expect(tomlContent).toMatch(/^\[vars\]/m);
	});

	// Cycle 2: PUBLIC_API_URL is declared in [vars]
	it("declares PUBLIC_API_URL in [vars]", () => {
		expect(tomlContent).toMatch(/^PUBLIC_API_URL\s*=/m);
	});

	// Cycle 3: PUBLIC_API_URL points to the deployed backend worker (not localhost)
	it("PUBLIC_API_URL is not the localhost fallback", () => {
		const match = tomlContent.match(/^PUBLIC_API_URL\s*=\s*"(.+)"/m);
		expect(match).not.toBeNull();
		expect(match?.[1]).not.toContain("localhost");
	});

	// Cycle 4: PUBLIC_API_URL uses https
	it("PUBLIC_API_URL uses https", () => {
		const match = tomlContent.match(/^PUBLIC_API_URL\s*=\s*"(.+)"/m);
		expect(match).not.toBeNull();
		expect(match?.[1]).toMatch(/^https:\/\//);
	});

	// Cycle 5: wrangler.toml PUBLIC_API_URL matches the typed constant
	it("PUBLIC_API_URL matches BACKEND_WORKER_URL constant", () => {
		const match = tomlContent.match(/^PUBLIC_API_URL\s*=\s*"(.+)"/m);
		expect(match?.[1]).toBe(BACKEND_WORKER_URL);
	});
});
