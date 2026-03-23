/**
 * Documentation contract tests for AGENTS.md route conventions.
 * Each test maps to one acceptance criterion from issue #59.
 */
import { describe, expect, it } from "bun:test";
import { agentsDoc as content } from "./agents-conventions.ts";

describe("AGENTS.md — route conventions", () => {
	it("documents route file location convention (shell/routes/<name>.ts)", () => {
		expect(content).toContain("shell/routes/");
	});

	it("documents RouteModule export shape ({ app, testApp })", () => {
		expect(content).toContain("RouteModule");
		expect(content).toContain("{ app, testApp }");
	});

	it("documents when to use defineRoute (single-dependency or no-dep routes)", () => {
		expect(content).toContain("defineRoute");
	});

	it("documents when to use routeEffect (multi-dependency or multi-step)", () => {
		expect(content).toContain("routeEffect");
	});

	it("documents api.ts registry rule (no handler logic allowed)", () => {
		expect(content).toContain("thin registry");
	});

	it("documents test rule (test via testApp, not api.ts)", () => {
		expect(content).toContain("testApp");
	});

	it("documents effect-handler.ts boundary rule (no imports from core/ or infra/)", () => {
		expect(content).toContain("effect-handler.ts");
	});
});
