import { describe, expect, it } from "bun:test";
import { ConfigTest } from "../../infra/config.ts";
import { buildVersionApp } from "./version.ts";

describe("GET /version via isolated test app", () => {
	const app = buildVersionApp(ConfigTest);

	it("returns 200 with version shape", async () => {
		const res = await app.request("/version");
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ version: "0.0.0", env: "test" });
	});
});
