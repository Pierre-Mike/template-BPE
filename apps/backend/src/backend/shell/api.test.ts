import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { getVersion } from "../core/version.ts";
import { ConfigService, ConfigTest } from "../infra/config.ts";

describe("GET /version program", () => {
	it("returns correct shape with ConfigTest layer", async () => {
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const config = yield* ConfigService;
				const raw = yield* config.get();
				return yield* getVersion(raw);
			}).pipe(Effect.provide(ConfigTest)),
		);
		expect(result).toEqual({ version: "0.0.0", env: "test" });
	});
});
