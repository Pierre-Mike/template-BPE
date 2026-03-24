import { Context, Effect, Layer } from "effect";
import { createNote, type Note, type NoteError, type NoteId, NoteNotFound } from "../core/note.ts";

interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = Record<string, unknown>>(): Promise<T | null>;
	all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
	run(): Promise<{ meta: { changes: number } }>;
}

interface D1Database {
	prepare(query: string): D1PreparedStatement;
}

export interface NoteListResult {
	readonly items: Note[];
	readonly nextCursor: NoteId | null;
}

export interface NoteRepository {
	readonly create: (input: {
		readonly id: string;
		readonly title: string;
		readonly body?: string;
	}) => Effect.Effect<Note, NoteError>;
	readonly findById: (id: NoteId) => Effect.Effect<Note, NoteNotFound>;
	readonly list: (options: {
		readonly cursor?: NoteId;
		readonly limit: number;
	}) => Effect.Effect<NoteListResult, never>;
	readonly delete: (id: NoteId) => Effect.Effect<void, NoteNotFound>;
}

export const NoteRepository = Context.GenericTag<NoteRepository>("NoteRepository");

export const NoteRepositoryTest: Layer.Layer<NoteRepository> = Layer.sync(NoteRepository, () => {
	const store = new Map<NoteId, Note>();

	return {
		create: (input) =>
			Effect.gen(function* () {
				const note = yield* createNote(input);
				store.set(note.id, note);
				return note;
			}),

		findById: (id) =>
			Effect.gen(function* () {
				const note = store.get(id);
				if (note === undefined) {
					return yield* Effect.fail(new NoteNotFound({ id }));
				}
				return note;
			}),

		list: ({ cursor, limit }) =>
			Effect.sync(() => {
				const all = Array.from(store.values());
				const startIndex = cursor === undefined ? 0 : all.findIndex((n) => n.id === cursor) + 1;
				const slice = all.slice(startIndex, startIndex + limit);
				const nextCursor =
					startIndex + limit < all.length ? (all[startIndex + limit - 1]?.id ?? null) : null;
				return { items: slice, nextCursor };
			}),

		delete: (id) =>
			Effect.gen(function* () {
				if (!store.has(id)) {
					return yield* Effect.fail(new NoteNotFound({ id }));
				}
				store.delete(id);
			}),
	};
});

export const makeNoteRepositoryLive = (d1: D1Database): Layer.Layer<NoteRepository> =>
	Layer.succeed(NoteRepository, {
		create: (input) =>
			Effect.gen(function* () {
				const note = yield* createNote(input);
				yield* Effect.promise(() =>
					d1
						.prepare("INSERT INTO notes (id, title, body, created_at) VALUES (?, ?, ?, ?)")
						.bind(note.id, note.title, note.body ?? null, note.createdAt.toISOString())
						.run(),
				);
				return note;
			}),

		findById: (id) =>
			Effect.gen(function* () {
				const row = yield* Effect.promise(() =>
					d1.prepare("SELECT id, title, body, created_at FROM notes WHERE id = ?").bind(id).first<{
						id: string;
						title: string;
						body: string | null;
						created_at: string;
					}>(),
				);
				if (row === null) {
					return yield* Effect.fail(new NoteNotFound({ id }));
				}
				return {
					id: row.id as NoteId,
					title: row.title,
					...(row.body !== null ? { body: row.body } : {}),
					createdAt: new Date(row.created_at),
				} satisfies Note;
			}),

		list: ({ cursor, limit }) =>
			Effect.gen(function* () {
				const rows = yield* Effect.promise(() => {
					if (cursor === undefined) {
						return d1
							.prepare(
								"SELECT id, title, body, created_at FROM notes ORDER BY created_at ASC LIMIT ?",
							)
							.bind(limit + 1)
							.all<{ id: string; title: string; body: string | null; created_at: string }>();
					}
					return d1
						.prepare(
							"SELECT id, title, body, created_at FROM notes WHERE created_at > (SELECT created_at FROM notes WHERE id = ?) ORDER BY created_at ASC LIMIT ?",
						)
						.bind(cursor, limit + 1)
						.all<{ id: string; title: string; body: string | null; created_at: string }>();
				});
				const hasMore = rows.results.length > limit;
				const items = rows.results.slice(0, limit).map(
					(row) =>
						({
							id: row.id as NoteId,
							title: row.title,
							...(row.body !== null ? { body: row.body } : {}),
							createdAt: new Date(row.created_at),
						}) satisfies Note,
				);
				const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;
				return { items, nextCursor };
			}),

		delete: (id) =>
			Effect.gen(function* () {
				const result = yield* Effect.promise(() =>
					d1.prepare("DELETE FROM notes WHERE id = ?").bind(id).run(),
				);
				if (result.meta.changes === 0) {
					return yield* Effect.fail(new NoteNotFound({ id }));
				}
			}),
	});
