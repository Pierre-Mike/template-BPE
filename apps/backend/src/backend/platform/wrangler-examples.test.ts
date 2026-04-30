import { describe, expect, it } from "bun:test";
import { WRANGLER_EXAMPLES } from "./wrangler-examples.ts";

// RED → GREEN: these tests fail until wrangler.toml is updated with commented binding examples.
// They verify that documentation-in-code examples exist without activating live bindings.
describe("wrangler.toml deployment config examples", () => {
	const wranglerPath = new URL("../../../wrangler.toml", import.meta.url);

	it("wrangler.toml exists", async () => {
		const file = Bun.file(wranglerPath);
		expect(await file.exists()).toBe(true);
	});

	it("contains a live (uncommented) [[d1_databases]] block", async () => {
		const source = await Bun.file(wranglerPath).text();
		// D1 is now provisioned — block must appear without a leading #
		expect(source).toMatch(/^\[\[d1_databases\]\]/m);
	});

	it('contains binding = "DB" in the d1_databases block', async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^binding\s*=\s*"DB"/m);
	});

	it("contains database_name in the d1_databases block", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^database_name\s*=/m);
	});

	it("contains database_id in the d1_databases block", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^database_id\s*=/m);
	});

	it("contains a commented [[kv_namespaces]] block", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^#\s*\[\[kv_namespaces\]\]/m);
	});

	it("contains id placeholder in the kv_namespaces example", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^#\s*id\s*=/m);
	});

	it("contains a commented [vars] section", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^#\s*\[vars\]/m);
	});

	it("has a live (uncommented) [[d1_databases]] block — D1 is now provisioned", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toMatch(/^\[\[d1_databases\]\]/m);
	});

	it("has no live (uncommented) [[kv_namespaces]] block", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).not.toMatch(/^\[\[kv_namespaces\]\]/m);
	});

	it("has no live (uncommented) [vars] section", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).not.toMatch(/^\[vars\]/m);
	});

	it("all example sections include explanatory inline comments", async () => {
		const source = await Bun.file(wranglerPath).text();
		// Verify there are multiple comment lines (documentation-in-code)
		const commentLines = source.split("\n").filter((line) => line.trim().startsWith("#"));
		expect(commentLines.length).toBeGreaterThan(5);
	});

	// Use the exported constants to verify markers are present
	it("contains the D1 section marker", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toContain(WRANGLER_EXAMPLES.D1_DATABASES_SECTION);
	});

	it("contains the KV section marker", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toContain(WRANGLER_EXAMPLES.KV_NAMESPACES_SECTION);
	});

	it("contains the vars section marker", async () => {
		const source = await Bun.file(wranglerPath).text();
		expect(source).toContain(WRANGLER_EXAMPLES.VARS_SECTION);
	});
});
