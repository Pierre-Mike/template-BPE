import { Effect, Layer } from "effect";
import { createNote, type Note, type NoteId, NoteNotFound } from "./note.core.ts";
import { NoteRepository } from "./note.repo.ts";

export const makeTestNoteRepository = (): Layer.Layer<NoteRepository> =>
	Layer.sync(NoteRepository, () => {
		const store = new Map<NoteId, Note>();

		return {
			create: (input) =>
				Effect.gen(function* () {
					const note = yield* createNote({ ...input, now: new Date() });
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
