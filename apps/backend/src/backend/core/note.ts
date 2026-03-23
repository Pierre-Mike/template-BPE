import { Schema } from "@effect/schema";
import { Data, Effect } from "effect";

export const NoteId = Schema.String.pipe(Schema.brand("NoteId"));
export type NoteId = Schema.Schema.Type<typeof NoteId>;

export const Note = Schema.Struct({
	id: NoteId,
	title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
	body: Schema.optionalWith(Schema.String.pipe(Schema.maxLength(2000)), { exact: true }),
	createdAt: Schema.Number,
});
export type Note = Schema.Schema.Type<typeof Note>;

export class NoteNotFound extends Data.TaggedError("NoteNotFound")<{
	readonly id: string;
}> {}

export class NoteTitleTooLong extends Data.TaggedError("NoteTitleTooLong")<{
	readonly title: string;
}> {}

export class NoteBodyTooLong extends Data.TaggedError("NoteBodyTooLong")<{
	readonly body: string;
}> {}

export type NoteError = NoteNotFound | NoteTitleTooLong | NoteBodyTooLong;

export type NoteInput = {
	readonly id: string;
	readonly title: string;
	readonly body?: string;
};

export const createNote = (input: NoteInput): Effect.Effect<Note, NoteError> => {
	if (input.title.length === 0 || input.title.length > 100) {
		return Effect.fail(new NoteTitleTooLong({ title: input.title }));
	}
	const body = input.body;
	if (body !== undefined && body.length > 2000) {
		return Effect.fail(new NoteBodyTooLong({ body }));
	}
	const id = input.id as NoteId;
	if (body !== undefined) {
		return Effect.succeed({ id, title: input.title, body, createdAt: Date.now() });
	}
	return Effect.succeed({ id, title: input.title, createdAt: Date.now() });
};

export const validateNote = (
	knownIds: ReadonlySet<string>,
	input: NoteInput,
): Effect.Effect<Note, NoteError> => {
	if (!knownIds.has(input.id)) {
		return Effect.fail(new NoteNotFound({ id: input.id }));
	}
	return createNote(input);
};
