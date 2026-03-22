import { describe, expect, it } from "bun:test";
import app from "./api.ts";

describe("GET /version", () => {
	it("returns 200 with version shape", async () => {
		const res = await app.request("/version", {}, { ENVIRONMENT: "test" });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ version: "0.0.0", env: "test" });
	});
});

describe("GET /health", () => {
	it("returns 200 with ok status", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toMatchObject({ status: "ok" });
	});
});
