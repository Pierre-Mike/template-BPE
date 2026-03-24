import { describe, expect, it } from "bun:test";
import type { D1Database, D1PreparedStatement } from "./d1-types.ts";

describe("D1 type definitions", () => {
	it("D1Database interface has prepare method", () => {
		const hasShape = (db: D1Database) => typeof db.prepare === "function";
		expect(hasShape).toBeDefined();
	});

	it("D1PreparedStatement interface has bind, first, all, run methods", () => {
		const hasShape = (stmt: D1PreparedStatement) =>
			typeof stmt.bind === "function" &&
			typeof stmt.first === "function" &&
			typeof stmt.all === "function" &&
			typeof stmt.run === "function";
		expect(hasShape).toBeDefined();
	});
});
