import { describe, expect, it } from "bun:test";
import { CLOUDFLARE_TOKEN_PERMISSIONS, GITHUB_SECRETS } from "./github-secrets.ts";

// RED → GREEN: these tests fail until github-secrets.ts is created with the correct constants.
// They verify that the required GitHub Actions secret names are documented as canonical constants,
// preventing accidental misspellings when referenced in CI workflows.
describe("GitHub Actions secrets for Cloudflare deployment", () => {
	it("exports CLOUDFLARE_API_TOKEN secret name", () => {
		expect(GITHUB_SECRETS.CLOUDFLARE_API_TOKEN).toBe("CLOUDFLARE_API_TOKEN");
	});

	it("exports CLOUDFLARE_ACCOUNT_ID secret name", () => {
		expect(GITHUB_SECRETS.CLOUDFLARE_ACCOUNT_ID).toBe("CLOUDFLARE_ACCOUNT_ID");
	});

	it("CLOUDFLARE_API_TOKEN is a non-empty string", () => {
		expect(typeof GITHUB_SECRETS.CLOUDFLARE_API_TOKEN).toBe("string");
		expect(GITHUB_SECRETS.CLOUDFLARE_API_TOKEN.length).toBeGreaterThan(0);
	});

	it("CLOUDFLARE_ACCOUNT_ID is a non-empty string", () => {
		expect(typeof GITHUB_SECRETS.CLOUDFLARE_ACCOUNT_ID).toBe("string");
		expect(GITHUB_SECRETS.CLOUDFLARE_ACCOUNT_ID.length).toBeGreaterThan(0);
	});

	it("both secret names contain no whitespace (valid GitHub secret names)", () => {
		expect(GITHUB_SECRETS.CLOUDFLARE_API_TOKEN).not.toMatch(/\s/);
		expect(GITHUB_SECRETS.CLOUDFLARE_ACCOUNT_ID).not.toMatch(/\s/);
	});

	it("both secret names are uppercase with underscores only (valid GitHub secret names)", () => {
		expect(GITHUB_SECRETS.CLOUDFLARE_API_TOKEN).toMatch(/^[A-Z_]+$/);
		expect(GITHUB_SECRETS.CLOUDFLARE_ACCOUNT_ID).toMatch(/^[A-Z_]+$/);
	});

	it("exports Workers Scripts:Edit permission", () => {
		expect(CLOUDFLARE_TOKEN_PERMISSIONS.WORKERS_SCRIPTS_EDIT).toBe("Workers Scripts:Edit");
	});

	it("exports Pages:Edit permission", () => {
		expect(CLOUDFLARE_TOKEN_PERMISSIONS.PAGES_EDIT).toBe("Pages:Edit");
	});

	it("all required permissions are defined", () => {
		const permissions = Object.values(CLOUDFLARE_TOKEN_PERMISSIONS);
		expect(permissions).toContain("Workers Scripts:Edit");
		expect(permissions).toContain("Pages:Edit");
	});
});

describe("CI pipeline — protects against credential leaks in git history", () => {
	const ciPath = new URL("../../../../.github/workflows/ci.yml", import.meta.url);

	it("ci.yml has a gitleaks secret-scan job", async () => {
		const source = await Bun.file(ciPath).text();
		expect(source).toContain("gitleaks");
	});

	it("secret-scan job fetches full git history (fetch-depth: 0)", async () => {
		const source = await Bun.file(ciPath).text();
		expect(source).toContain("fetch-depth: 0");
	});

	it("gitleaks job authenticates via GITHUB_TOKEN — no hardcoded credentials", async () => {
		const source = await Bun.file(ciPath).text();
		expect(source).toContain("secrets.GITHUB_TOKEN");
	});
});
