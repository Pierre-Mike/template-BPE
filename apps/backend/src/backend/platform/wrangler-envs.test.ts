/**
 * TDD: RED phase — tests written before wrangler.toml env blocks are added.
 * Verifies that [env.staging] and [env.production] sections exist in apps/backend/wrangler.toml.
 */
import { describe, expect, it } from "bun:test";
import { WRANGLER_ENVS } from "./wrangler-envs.ts";

describe("wrangler.toml environment blocks (backend)", () => {
	const wranglerPath = new URL("../../../wrangler.toml", import.meta.url);

	it("contains [env.staging] section", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^\[env\.staging\]/m);
	});

	it("contains [env.production] section", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^\[env\.production\]/m);
	});

	it("staging has a distinct worker name", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toContain(WRANGLER_ENVS.STAGING_NAME);
	});

	it("production has a distinct worker name", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toContain(WRANGLER_ENVS.PRODUCTION_NAME);
	});

	it("staging and production names are different from the root name", () => {
		expect(WRANGLER_ENVS.STAGING_NAME).not.toBe("template-bpe-backend");
		expect(WRANGLER_ENVS.PRODUCTION_NAME).not.toBe("template-bpe-backend");
	});

	it("staging and production names are different from each other", async () => {
		expect(WRANGLER_ENVS.STAGING_NAME).not.toBe(WRANGLER_ENVS.PRODUCTION_NAME);
	});
});
