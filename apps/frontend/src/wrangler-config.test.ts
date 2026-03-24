/**
 * TDD: RED phase — tests written before implementation.
 *
 * Acceptance criteria:
 * - apps/frontend/wrangler.toml contains a [vars] section with PUBLIC_API_URL set to the deployed backend Worker URL
 * - apps/frontend/wrangler.toml contains [env.staging.vars] with a staging backend URL
 * - apps/frontend/wrangler.toml contains [env.production.vars] with a production backend URL
 * - No changes to any Astro page files
 */

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	BACKEND_WORKER_URL,
	PRODUCTION_BACKEND_WORKER_URL,
	STAGING_BACKEND_WORKER_URL,
} from "./wrangler-config.ts";

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

describe("apps/frontend/wrangler.toml — staging environment", () => {
	// Cycle 6: [env.staging.vars] section exists
	it("contains a [env.staging.vars] section", () => {
		expect(tomlContent).toMatch(/^\[env\.staging\.vars\]/m);
	});

	// Cycle 7: staging section declares PUBLIC_API_URL
	it("declares PUBLIC_API_URL in [env.staging.vars]", () => {
		const stagingBlock = tomlContent.match(/\[env\.staging\.vars\]([\s\S]*?)(?=\[|$)/);
		expect(stagingBlock).not.toBeNull();
		expect(stagingBlock?.[1]).toMatch(/PUBLIC_API_URL\s*=/);
	});

	// Cycle 8: staging PUBLIC_API_URL uses https and not localhost
	it("staging PUBLIC_API_URL uses https and not localhost", () => {
		const stagingBlock = tomlContent.match(/\[env\.staging\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = stagingBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match).not.toBeNull();
		expect(match?.[1]).toMatch(/^https:\/\//);
		expect(match?.[1]).not.toContain("localhost");
	});

	// Cycle 9: staging PUBLIC_API_URL matches typed constant
	it("staging PUBLIC_API_URL matches STAGING_BACKEND_WORKER_URL constant", () => {
		const stagingBlock = tomlContent.match(/\[env\.staging\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = stagingBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match?.[1]).toBe(STAGING_BACKEND_WORKER_URL);
	});
});

describe("apps/frontend/wrangler.toml — production environment", () => {
	// Cycle 10: [env.production.vars] section exists
	it("contains a [env.production.vars] section", () => {
		expect(tomlContent).toMatch(/^\[env\.production\.vars\]/m);
	});

	// Cycle 11: production section declares PUBLIC_API_URL
	it("declares PUBLIC_API_URL in [env.production.vars]", () => {
		const prodBlock = tomlContent.match(/\[env\.production\.vars\]([\s\S]*?)(?=\[|$)/);
		expect(prodBlock).not.toBeNull();
		expect(prodBlock?.[1]).toMatch(/PUBLIC_API_URL\s*=/);
	});

	// Cycle 12: production PUBLIC_API_URL uses https and not localhost
	it("production PUBLIC_API_URL uses https and not localhost", () => {
		const prodBlock = tomlContent.match(/\[env\.production\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = prodBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match).not.toBeNull();
		expect(match?.[1]).toMatch(/^https:\/\//);
		expect(match?.[1]).not.toContain("localhost");
	});

	// Cycle 13: production PUBLIC_API_URL matches typed constant
	it("production PUBLIC_API_URL matches PRODUCTION_BACKEND_WORKER_URL constant", () => {
		const prodBlock = tomlContent.match(/\[env\.production\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = prodBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match?.[1]).toBe(PRODUCTION_BACKEND_WORKER_URL);
	});
});

describe("apps/frontend/wrangler.toml — environment isolation", () => {
	// Cycle 14: staging and production URLs are distinct
	it("staging URL differs from production URL", () => {
		expect(STAGING_BACKEND_WORKER_URL).not.toBe(PRODUCTION_BACKEND_WORKER_URL);
	});

	// Cycle 15: default [vars] remains unchanged as safe fallback
	it("default [vars] PUBLIC_API_URL still exists as fallback", () => {
		const match = tomlContent.match(/^PUBLIC_API_URL\s*=\s*"(.+)"/m);
		expect(match?.[1]).toBe(BACKEND_WORKER_URL);
	});
});
