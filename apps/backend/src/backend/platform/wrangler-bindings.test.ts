import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BINDINGS } from "./wrangler-bindings.ts";

const wranglerToml = readFileSync(join(import.meta.dir, "../../../wrangler.toml"), "utf-8");

describe("wrangler.toml deployment config examples", () => {
	it("contains a live [[d1_databases]] block with required fields", () => {
		expect(wranglerToml).toContain("[[d1_databases]]");
		expect(wranglerToml).toContain(`binding = "${BINDINGS.D1}"`);
		expect(wranglerToml).toContain("database_name");
		expect(wranglerToml).toContain("database_id");
	});

	it("contains a commented [[kv_namespaces]] block as an alternative example", () => {
		expect(wranglerToml).toContain("# [[kv_namespaces]]");
		expect(wranglerToml).toContain(`# binding = "${BINDINGS.KV}"`);
		expect(wranglerToml).toContain("# id");
	});

	it("contains a commented [vars] section example", () => {
		expect(wranglerToml).toContain("# [vars]");
	});

	it("has no live (uncommented) [[kv_namespaces]] or [vars] blocks", () => {
		const lines = wranglerToml.split("\n");
		const unexpectedLiveBindings = lines.filter(
			(line) => /^\[\[kv_namespaces\]\]/.test(line) || /^\[vars\]/.test(line),
		);
		expect(unexpectedLiveBindings).toHaveLength(0);
	});
});
