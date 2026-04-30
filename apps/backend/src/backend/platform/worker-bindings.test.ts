import { describe, expect, it } from "bun:test";
import type { WorkerBindings } from "./worker-bindings.ts";

describe("WorkerBindings", () => {
	it("has ENVIRONMENT as an optional string", () => {
		// Type-level: WorkerBindings must be assignable with or without ENVIRONMENT.
		const withEnv: WorkerBindings = { ENVIRONMENT: "staging", DB: null as never };
		const withoutEnv: WorkerBindings = { DB: null as never };
		expect(withEnv.ENVIRONMENT).toBe("staging");
		expect(withoutEnv.ENVIRONMENT).toBeUndefined();
	});

	it("has DB as a required D1Database binding", () => {
		const hasDB = (b: WorkerBindings) => "DB" in b;
		expect(hasDB({ DB: null as never })).toBe(true);
	});
});
