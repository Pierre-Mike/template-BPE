import { describe, expect, it } from "bun:test";
import { Effect, Either } from "effect";
import {
	createNote,
	NoteBodyTooLong,
	type NoteId,
	NoteNotFound,
	NoteTitleTooLong,
	validateNote,
} from "./note.ts";

describe("createNote", () => {
	it("creates a valid note with body", async () => {
		const result = await Effect.runPromise(
			createNote({ id: "note-1", title: "Hello World", body: "Some content" }),
		);
		expect(result.id as string).toBe("note-1");
		expect(result.title).toBe("Hello World");
		expect(result.body).toBe("Some content");
		expect(result.createdAt).toBeInstanceOf(Date);
	});

	it("creates a valid note without body", async () => {
		const result = await Effect.runPromise(createNote({ id: "note-2", title: "Hello World" }));
		expect(result.title).toBe("Hello World");
		expect(result.body).toBeUndefined();
	});

	it("creates a valid note with max-length title (100 chars)", async () => {
		const title = "a".repeat(100);
		const result = await Effect.runPromise(createNote({ id: "note-3", title }));
		expect(result.title).toBe(title);
	});

	it("fails with NoteTitleTooLong for title over 100 chars", async () => {
		const title = "a".repeat(101);
		const result = await Effect.runPromise(Effect.either(createNote({ id: "note-1", title })));
		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(NoteTitleTooLong);
			if (result.left instanceof NoteTitleTooLong) {
				expect(result.left.title).toBe(title);
			}
		}
	});

	it("fails with NoteTitleTooLong for empty title", async () => {
		const result = await Effect.runPromise(Effect.either(createNote({ id: "note-1", title: "" })));
		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(NoteTitleTooLong);
		}
	});

	it("fails with NoteBodyTooLong for body over 2000 chars", async () => {
		const body = "a".repeat(2001);
		const result = await Effect.runPromise(
			Effect.either(createNote({ id: "note-1", title: "Hello", body })),
		);
		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(NoteBodyTooLong);
			if (result.left instanceof NoteBodyTooLong) {
				expect(result.left.body).toBe(body);
			}
		}
	});

	it("creates a valid note with max-length body (2000 chars)", async () => {
		const body = "a".repeat(2000);
		const result = await Effect.runPromise(createNote({ id: "note-4", title: "Hello", body }));
		expect(result.body).toBe(body);
	});
});

describe("validateNote", () => {
	it("succeeds with valid title and body", async () => {
		await Effect.runPromise(validateNote({ title: "Hello", body: "World" }));
	});

	it("succeeds with valid title and no body", async () => {
		await Effect.runPromise(validateNote({ title: "Hello" }));
	});

	it("fails with NoteTitleTooLong for title over 100 chars", async () => {
		const title = "a".repeat(101);
		const result = await Effect.runPromise(Effect.either(validateNote({ title })));
		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(NoteTitleTooLong);
		}
	});

	it("fails with NoteTitleTooLong for empty title", async () => {
		const result = await Effect.runPromise(Effect.either(validateNote({ title: "" })));
		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(NoteTitleTooLong);
		}
	});

	it("fails with NoteBodyTooLong for body over 2000 chars", async () => {
		const body = "a".repeat(2001);
		const result = await Effect.runPromise(Effect.either(validateNote({ title: "Hello", body })));
		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(NoteBodyTooLong);
		}
	});
});

describe("typed errors", () => {
	it("NoteNotFound has correct _tag", () => {
		const err = new NoteNotFound({ id: "note-1" as unknown as NoteId });
		expect(err._tag).toBe("NoteNotFound");
	});

	it("NoteTitleTooLong has correct _tag and title", () => {
		const err = new NoteTitleTooLong({ title: "too long title" });
		expect(err._tag).toBe("NoteTitleTooLong");
		expect(err.title).toBe("too long title");
	});

	it("NoteBodyTooLong has correct _tag and body", () => {
		const err = new NoteBodyTooLong({ body: "too long body" });
		expect(err._tag).toBe("NoteBodyTooLong");
		expect(err.body).toBe("too long body");
	});
});
