import { describe, expect, it } from "bun:test";
import { aboutRoute } from "./about.routes.ts";

describe("GET /about", () => {
	it("200 returns name and description", async () => {
		const res = await aboutRoute.testApp.request("/about");
		expect(res.status).toBe(200);
		const body = (await res.json()) as { name: string; description: string };
		expect(body.name).toBe("template-BPE");
		expect(body.description).toBe("Effect-TS + Hono + Astro monorepo template");
	});
});
