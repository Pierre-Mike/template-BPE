import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import {
	createNote,
	NoteBodyTooLong,
	NoteNotFound,
	NoteTitleTooLong,
	validateNote,
} from "./note.ts";

describe("createNote", () => {
	it("succeeds with valid input (no body)", async () => {
		const note = await Effect.runPromise(createNote({ id: "1", title: "Hello" }));
		expect(note.title).toBe("Hello");
		expect(note.id as string).toBe("1");
		expect(note.body).toBeUndefined();
	});

	it("succeeds with valid input (with body)", async () => {
		const note = await Effect.runPromise(createNote({ id: "1", title: "Hello", body: "World" }));
		expect(note.body).toBe("World");
	});

	it("succeeds with max-length title (100 chars)", async () => {
		const title = "a".repeat(100);
		const note = await Effect.runPromise(createNote({ id: "1", title }));
		expect(note.title).toBe(title);
	});

	it("succeeds with max-length body (2000 chars)", async () => {
		const body = "a".repeat(2000);
		const note = await Effect.runPromise(createNote({ id: "1", title: "Hello", body }));
		expect(note.body).toBe(body);
	});

	it("fails with NoteTitleTooLong when title exceeds 100 chars", async () => {
		const error = await Effect.runPromise(
			Effect.flip(createNote({ id: "1", title: "a".repeat(101) })),
		);
		expect(error).toBeInstanceOf(NoteTitleTooLong);
	});

	it("fails with NoteTitleTooLong when title is empty", async () => {
		const error = await Effect.runPromise(Effect.flip(createNote({ id: "1", title: "" })));
		expect(error).toBeInstanceOf(NoteTitleTooLong);
	});

	it("fails with NoteBodyTooLong when body exceeds 2000 chars", async () => {
		const error = await Effect.runPromise(
			Effect.flip(createNote({ id: "1", title: "Hello", body: "a".repeat(2001) })),
		);
		expect(error).toBeInstanceOf(NoteBodyTooLong);
	});
});

describe("validateNote", () => {
	const knownIds = new Set(["id-1", "id-2"]);

	it("succeeds for known id with valid input", async () => {
		const note = await Effect.runPromise(validateNote(knownIds, { id: "id-1", title: "Hello" }));
		expect(note.id as string).toBe("id-1");
	});

	it("fails with NoteNotFound for unknown id", async () => {
		const error = await Effect.runPromise(
			Effect.flip(validateNote(knownIds, { id: "unknown", title: "Hello" })),
		);
		expect(error).toBeInstanceOf(NoteNotFound);
	});

	it("fails with NoteTitleTooLong for empty title on known id", async () => {
		const error = await Effect.runPromise(
			Effect.flip(validateNote(knownIds, { id: "id-1", title: "" })),
		);
		expect(error).toBeInstanceOf(NoteTitleTooLong);
	});

	it("fails with NoteBodyTooLong for body exceeding 2000 chars on known id", async () => {
		const error = await Effect.runPromise(
			Effect.flip(validateNote(knownIds, { id: "id-1", title: "Hello", body: "a".repeat(2001) })),
		);
		expect(error).toBeInstanceOf(NoteBodyTooLong);
	});
});
