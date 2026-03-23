import { Schema } from "@effect/schema";
import { Data, Effect } from "effect";

export const NoteId = Schema.String.pipe(Schema.brand("NoteId"));
export type NoteId = Schema.Schema.Type<typeof NoteId>;

export const Note = Schema.Struct({
	id: NoteId,
	title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
	body: Schema.optional(Schema.String.pipe(Schema.maxLength(2000))),
	createdAt: Schema.DateFromSelf,
});
export type Note = Schema.Schema.Type<typeof Note>;

export class NoteNotFound extends Data.TaggedError("NoteNotFound")<{
	readonly id: NoteId;
}> {}

export class NoteTitleTooLong extends Data.TaggedError("NoteTitleTooLong")<{
	readonly title: string;
}> {}

export class NoteBodyTooLong extends Data.TaggedError("NoteBodyTooLong")<{
	readonly body: string;
}> {}

export type NoteError = NoteNotFound | NoteTitleTooLong | NoteBodyTooLong;

const validateTitle = (title: string): Effect.Effect<void, NoteTitleTooLong> =>
	title.length === 0 || title.length > 100
		? Effect.fail(new NoteTitleTooLong({ title }))
		: Effect.void;

const validateBody = (body: string): Effect.Effect<void, NoteBodyTooLong> =>
	body.length > 2000 ? Effect.fail(new NoteBodyTooLong({ body })) : Effect.void;

export const validateNote = (input: {
	readonly title: string;
	readonly body?: string;
}): Effect.Effect<void, NoteError> =>
	Effect.gen(function* () {
		yield* validateTitle(input.title);
		if (input.body !== undefined) {
			yield* validateBody(input.body);
		}
	});

export const createNote = (input: {
	readonly id: string;
	readonly title: string;
	readonly body?: string;
}): Effect.Effect<Note, NoteError> =>
	Effect.gen(function* () {
		yield* validateTitle(input.title);
		if (input.body !== undefined) {
			yield* validateBody(input.body);
		}
		return {
			id: input.id as NoteId,
			title: input.title,
			...(input.body !== undefined ? { body: input.body } : {}),
			createdAt: new Date(),
		};
	});
