/**
 * TDD: RED phase — tests written before wrangler.toml env blocks are added.
 * Verifies that [env.staging] and [env.production] sections exist in apps/frontend/wrangler.toml.
 */
import { describe, expect, it } from "bun:test";
import { FRONTEND_WRANGLER_ENVS } from "./wrangler-envs.ts";

describe("wrangler.toml environment blocks (frontend)", () => {
	const wranglerPath = new URL("../wrangler.toml", import.meta.url);

	it("contains [env.staging] section", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^\[env\.staging\]/m);
	});

	it("contains [env.production] section", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^\[env\.production\]/m);
	});

	it("staging has a distinct app name", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toContain(FRONTEND_WRANGLER_ENVS.STAGING_NAME);
	});

	it("production has a distinct app name", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toContain(FRONTEND_WRANGLER_ENVS.PRODUCTION_NAME);
	});

	it("staging and production names are different from the root name", () => {
		expect(FRONTEND_WRANGLER_ENVS.STAGING_NAME).not.toBe("template-bpe-frontend");
		expect(FRONTEND_WRANGLER_ENVS.PRODUCTION_NAME).not.toBe("template-bpe-frontend");
	});

	it("staging and production names are different from each other", () => {
		expect(FRONTEND_WRANGLER_ENVS.STAGING_NAME).not.toBe(FRONTEND_WRANGLER_ENVS.PRODUCTION_NAME);
	});
});
