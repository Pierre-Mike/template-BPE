import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import type { NoteId } from "../core/note.ts";
import { NoteRepository } from "./note-repository.ts";
import { makeTestNoteRepository } from "./note-repository-test.ts";

describe("makeTestNoteRepository", () => {
	it("returns a Layer that provides NoteRepository", async () => {
		const layer = makeTestNoteRepository();
		const result = await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					return yield* repo.create({ id: "test-1", title: "Test" });
				}),
				layer,
			),
		);
		expect(result.title).toBe("Test");
	});

	it("two calls return Layers backed by independent Map instances", async () => {
		const layer1 = makeTestNoteRepository();
		const layer2 = makeTestNoteRepository();

		// Insert a note into layer1
		await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					yield* repo.create({ id: "shared-id", title: "In layer1" });
				}),
				layer1,
			),
		);

		// layer2 should be empty — its Map is independent
		const result = await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					return yield* repo.list({ limit: 100 });
				}),
				layer2,
			),
		);
		expect(result.items.length).toBe(0);
	});

	it("each call creates a fresh isolated store", async () => {
		const layer = makeTestNoteRepository();

		const { items } = await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					yield* repo.create({ id: "n1", title: "Note 1" });
					yield* repo.create({ id: "n2", title: "Note 2" });
					return yield* repo.list({ limit: 10 });
				}),
				layer,
			),
		);
		expect(items.length).toBe(2);

		// A brand-new layer has an empty store
		const layer2 = makeTestNoteRepository();
		const { items: items2 } = await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					return yield* repo.list({ limit: 10 });
				}),
				layer2,
			),
		);
		expect(items2.length).toBe(0);
	});

	it("returns NoteNotFound for missing id", async () => {
		const result = await Effect.runPromise(
			Effect.provide(
				Effect.gen(function* () {
					const repo = yield* NoteRepository;
					return yield* Effect.either(repo.findById("missing" as NoteId));
				}),
				makeTestNoteRepository(),
			),
		);
		expect(result._tag).toBe("Left");
		if (result._tag === "Left") {
			expect(result.left._tag).toBe("NoteNotFound");
		}
	});
});
