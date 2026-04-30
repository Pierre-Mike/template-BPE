import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import type { NoteId } from "./note.core.ts";
import { makeTestNoteRepository, NoteRepository } from "./note.repo.ts";

const run = <A, E>(effect: Effect.Effect<A, E, NoteRepository>) =>
	Effect.runPromise(Effect.provide(effect, makeTestNoteRepository()));

describe("NoteRepository - create + findById", () => {
	it("creates a note and retrieves it by id", async () => {
		const result = await run(
			Effect.gen(function* () {
				const repo = yield* NoteRepository;
				const note = yield* repo.create({ id: "note-1", title: "Hello", body: "World" });
				const found = yield* repo.findById(note.id);
				return found;
			}),
		);
		expect(result.title).toBe("Hello");
		expect(result.body).toBe("World");
	});

	it("returns NoteNotFound when id does not exist", async () => {
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

describe("NoteRepository - list with cursor pagination", () => {
	it("returns all notes when no cursor", async () => {
		const result = await run(
			Effect.gen(function* () {
				const repo = yield* NoteRepository;
				yield* repo.create({ id: "a", title: "A" });
				yield* repo.create({ id: "b", title: "B" });
				yield* repo.create({ id: "c", title: "C" });
				return yield* repo.list({ limit: 10 });
			}),
		);
		expect(result.items.length).toBe(3);
		expect(result.nextCursor).toBeNull();
	});

	it("returns nextCursor when there are more items", async () => {
		const result = await run(
			Effect.gen(function* () {
				const repo = yield* NoteRepository;
				yield* repo.create({ id: "x", title: "X" });
				yield* repo.create({ id: "y", title: "Y" });
				yield* repo.create({ id: "z", title: "Z" });
				return yield* repo.list({ limit: 2 });
			}),
		);
		expect(result.items.length).toBe(2);
		expect(result.nextCursor).not.toBeNull();
	});

	it("returns items after cursor", async () => {
		const result = await run(
			Effect.gen(function* () {
				const repo = yield* NoteRepository;
				yield* repo.create({ id: "p1", title: "P1" });
				yield* repo.create({ id: "p2", title: "P2" });
				yield* repo.create({ id: "p3", title: "P3" });
				const page1 = yield* repo.list({ limit: 1 });
				const opts =
					page1.nextCursor !== null ? { cursor: page1.nextCursor, limit: 10 } : { limit: 10 };
				return yield* repo.list(opts);
			}),
		);
		expect(result.items.length).toBeGreaterThan(0);
	});
});

describe("NoteRepository - delete", () => {
	it("deletes an existing note", async () => {
		const result = await run(
			Effect.gen(function* () {
				const repo = yield* NoteRepository;
				const note = yield* repo.create({ id: "del-1", title: "Delete me" });
				yield* repo.delete(note.id);
				return yield* Effect.either(repo.findById(note.id));
			}),
		);
		expect(result._tag).toBe("Left");
	});

	it("returns NoteNotFound when deleting non-existent note", async () => {
		const result = await run(
			Effect.gen(function* () {
				const repo = yield* NoteRepository;
				return yield* Effect.either(repo.delete("ghost" as NoteId));
			}),
		);
		expect(result._tag).toBe("Left");
		if (result._tag === "Left") {
			expect(result.left._tag).toBe("NoteNotFound");
		}
	});
});
