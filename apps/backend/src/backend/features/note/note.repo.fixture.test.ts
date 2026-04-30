import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { makeTestNoteRepository } from "./note.repo.fixture.ts";
import { NoteRepository } from "./note.repo.ts";

describe("makeTestNoteRepository", () => {
	it("exports a factory function", () => {
		expect(typeof makeTestNoteRepository).toBe("function");
	});

	it("returns a Layer", () => {
		const layer = makeTestNoteRepository();
		expect(layer).toBeDefined();
	});

	it("two calls return independent Map instances (insert into one, other is empty)", async () => {
		const layer1 = makeTestNoteRepository();
		const layer2 = makeTestNoteRepository();

		// Insert a note using layer1
		await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					yield* repo.create({ id: "note-1", title: "Hello" });
				}),
				layer1,
			),
		);

		// layer2 should be empty
		const result = await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					return yield* repo.list({ limit: 10 });
				}),
				layer2,
			),
		);

		expect(result.items.length).toBe(0);
	});
});
