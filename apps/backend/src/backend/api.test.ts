import { describe, expect, it } from "bun:test";
import { readdir } from "node:fs/promises";
import app from "./api.ts";

// RED → GREEN: api.ts must never call Effect.runPromise directly.
// Effect lifecycle is owned by effect-handler.ts; api.ts only composes routes.
describe("boundary invariant: no raw Effect.runPromise in api.ts", () => {
	it("api.ts does not contain Effect.runPromise(", async () => {
		const source = await Bun.file(new URL("./api.ts", import.meta.url)).text();
		expect(source).not.toContain("Effect.runPromise(");
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

describe("structural: all route modules mounted in api.ts", () => {
	it("api.ts imports every *.routes.ts file in features/", async () => {
		const featuresDir = new URL("./features/", import.meta.url).pathname;
		const slices = await readdir(featuresDir, { withFileTypes: true });
		const source = await Bun.file(new URL("./api.ts", import.meta.url)).text();

		for (const slice of slices) {
			if (!slice.isDirectory()) continue;
			const sliceFiles = await readdir(new URL(`./features/${slice.name}/`, import.meta.url));
			const routeFile = sliceFiles.find((f) => f.endsWith(".routes.ts") && !f.includes(".test"));
			if (routeFile === undefined) continue;
			const importPath = `./features/${slice.name}/${routeFile}`;
			expect(source, `api.ts should import from ${importPath}`).toContain(importPath);
		}
	});
});
