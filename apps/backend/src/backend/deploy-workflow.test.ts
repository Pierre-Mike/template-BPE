/**
 * TDD: RED → GREEN for the deploy workflow constants.
 *
 * Note: .github/workflows/deploy.yml cannot be committed by a GitHub App token
 * without the `workflows` permission. The YAML content is documented in
 * DEPLOY_WORKFLOW.YAML_TEMPLATE for reference. A human with the `workflows`
 * permission must create the file from that template.
 *
 * These tests validate the canonical constants used by deploy.yml so that
 * any rename of the CI workflow, worker name, or deploy directory is caught.
 */
import { describe, expect, it } from "bun:test";
import { DEPLOY_WORKFLOW } from "./deploy-workflow.ts";

describe("DEPLOY_WORKFLOW constants", () => {
	it("CI_WORKFLOW_NAME is a non-empty string", () => {
		expect(typeof DEPLOY_WORKFLOW.CI_WORKFLOW_NAME).toBe("string");
		expect(DEPLOY_WORKFLOW.CI_WORKFLOW_NAME.length).toBeGreaterThan(0);
	});

	it("CI_WORKFLOW_NAME matches the name in ci.yml", async () => {
		const ciPath = new URL("../../../../.github/workflows/ci.yml", import.meta.url);
		const source = await Bun.file(ciPath).text();
		// ci.yml starts with "name: <CI_WORKFLOW_NAME>"
		expect(source).toContain(`name: ${DEPLOY_WORKFLOW.CI_WORKFLOW_NAME}`);
	});

	it("BACKEND_DIR points to apps/backend", () => {
		expect(DEPLOY_WORKFLOW.BACKEND_DIR).toBe("apps/backend");
	});

	it("FRONTEND_DIR points to apps/frontend", () => {
		expect(DEPLOY_WORKFLOW.FRONTEND_DIR).toBe("apps/frontend");
	});

	it("STAGING_ENV is staging", () => {
		expect(DEPLOY_WORKFLOW.STAGING_ENV).toBe("staging");
	});

	it("YAML_TEMPLATE is a non-empty string (documents the workflow to be created)", () => {
		expect(typeof DEPLOY_WORKFLOW.YAML_TEMPLATE).toBe("string");
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE.length).toBeGreaterThan(0);
	});

	it("YAML_TEMPLATE references workflow_run trigger", () => {
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE).toContain("workflow_run");
	});

	it("YAML_TEMPLATE references the CI workflow name", () => {
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE).toContain(DEPLOY_WORKFLOW.CI_WORKFLOW_NAME);
	});

	it("YAML_TEMPLATE gates on conclusion == success", () => {
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE).toContain("conclusion");
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE).toContain("success");
	});

	it("YAML_TEMPLATE references CLOUDFLARE_API_TOKEN secret", () => {
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE).toContain("secrets.CLOUDFLARE_API_TOKEN");
	});

	it("YAML_TEMPLATE references CLOUDFLARE_ACCOUNT_ID secret", () => {
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE).toContain("secrets.CLOUDFLARE_ACCOUNT_ID");
	});

	it("YAML_TEMPLATE deploys backend first (backend dir appears before frontend dir)", () => {
		const backendIdx = DEPLOY_WORKFLOW.YAML_TEMPLATE.indexOf(DEPLOY_WORKFLOW.BACKEND_DIR);
		const frontendIdx = DEPLOY_WORKFLOW.YAML_TEMPLATE.indexOf(DEPLOY_WORKFLOW.FRONTEND_DIR);
		expect(backendIdx).toBeGreaterThan(-1);
		expect(frontendIdx).toBeGreaterThan(-1);
		expect(backendIdx).toBeLessThan(frontendIdx);
	});

	it("YAML_TEMPLATE uses --env staging for wrangler deploy", () => {
		expect(DEPLOY_WORKFLOW.YAML_TEMPLATE).toContain(`--env ${DEPLOY_WORKFLOW.STAGING_ENV}`);
	});
});
