/**
 * TDD: Tests for wrangler.toml configuration.
 *
 * Acceptance criteria:
 * - Root [vars] does NOT set PUBLIC_API_URL (breaks dev mode by routing to production)
 * - [env.staging.vars] sets PUBLIC_API_URL to the staging backend URL
 * - [env.production.vars] sets PUBLIC_API_URL to the production backend URL
 * - Astro pages fall back to localhost when PUBLIC_API_URL is unset (dev mode)
 */

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCTION_BACKEND_WORKER_URL, STAGING_BACKEND_WORKER_URL } from "./wrangler-config.ts";

const tomlPath = resolve(import.meta.dir, "../wrangler.toml");
const tomlContent = readFileSync(tomlPath, "utf-8");

describe("apps/frontend/wrangler.toml", () => {
	it("does NOT set PUBLIC_API_URL in root [vars]", () => {
		// Root [vars] should not contain PUBLIC_API_URL — setting it breaks
		// `astro dev` by routing SSR requests to the production backend.
		// Extract the root section (before any [env.*] block)
		const rootSection = tomlContent.split(/^\[env\./m)[0];
		expect(rootSection).not.toMatch(/^PUBLIC_API_URL\s*=/m);
	});
});

describe("apps/frontend/wrangler.toml — staging environment", () => {
	it("contains a [env.staging.vars] section", () => {
		expect(tomlContent).toMatch(/^\[env\.staging\.vars\]/m);
	});

	it("declares PUBLIC_API_URL in [env.staging.vars]", () => {
		const stagingBlock = tomlContent.match(/\[env\.staging\.vars\]([\s\S]*?)(?=\[|$)/);
		expect(stagingBlock).not.toBeNull();
		expect(stagingBlock?.[1]).toMatch(/PUBLIC_API_URL\s*=/);
	});

	it("staging PUBLIC_API_URL uses https and not localhost", () => {
		const stagingBlock = tomlContent.match(/\[env\.staging\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = stagingBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match).not.toBeNull();
		expect(match?.[1]).toMatch(/^https:\/\//);
		expect(match?.[1]).not.toContain("localhost");
	});

	it("staging PUBLIC_API_URL matches STAGING_BACKEND_WORKER_URL constant", () => {
		const stagingBlock = tomlContent.match(/\[env\.staging\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = stagingBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match?.[1]).toBe(STAGING_BACKEND_WORKER_URL);
	});
});

describe("apps/frontend/wrangler.toml — production environment", () => {
	it("contains a [env.production.vars] section", () => {
		expect(tomlContent).toMatch(/^\[env\.production\.vars\]/m);
	});

	it("declares PUBLIC_API_URL in [env.production.vars]", () => {
		const prodBlock = tomlContent.match(/\[env\.production\.vars\]([\s\S]*?)(?=\[|$)/);
		expect(prodBlock).not.toBeNull();
		expect(prodBlock?.[1]).toMatch(/PUBLIC_API_URL\s*=/);
	});

	it("production PUBLIC_API_URL uses https and not localhost", () => {
		const prodBlock = tomlContent.match(/\[env\.production\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = prodBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match).not.toBeNull();
		expect(match?.[1]).toMatch(/^https:\/\//);
		expect(match?.[1]).not.toContain("localhost");
	});

	it("production PUBLIC_API_URL matches PRODUCTION_BACKEND_WORKER_URL constant", () => {
		const prodBlock = tomlContent.match(/\[env\.production\.vars\]([\s\S]*?)(?=\[|$)/);
		const match = prodBlock?.[1]?.match(/PUBLIC_API_URL\s*=\s*"(.+)"/);
		expect(match?.[1]).toBe(PRODUCTION_BACKEND_WORKER_URL);
	});
});

describe("apps/frontend/wrangler.toml — environment isolation", () => {
	it("staging URL differs from production URL", () => {
		expect(STAGING_BACKEND_WORKER_URL).not.toBe(PRODUCTION_BACKEND_WORKER_URL);
	});
});
