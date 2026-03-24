import { Effect, type Layer } from "effect";
import type { Context } from "hono";
import { Hono } from "hono";
import { NoteBodyTooLong, type NoteId, NoteNotFound, NoteTitleTooLong } from "../../core/note.ts";
import { makeNoteRepositoryLive, NoteRepository } from "../../infra/note-repository.ts";
import { defineRoute, type WorkerBindings } from "../effect-handler.ts";
import type { RouteModule } from "./_types.ts";

// ---------------------------------------------------------------------------
// Error → Response mapper (shared across all note routes)
// ---------------------------------------------------------------------------
type AnyContext = Context<{ Bindings: WorkerBindings }>;

type NoteRouteError = NoteNotFound | NoteTitleTooLong | NoteBodyTooLong;

const onNoteError = (error: NoteRouteError, _c: AnyContext): Response => {
	if (error instanceof NoteNotFound) {
		return new Response(JSON.stringify({ error: `Note not found: ${error.id}` }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}
	if (error instanceof NoteTitleTooLong || error instanceof NoteBodyTooLong) {
		return new Response(JSON.stringify({ error: error.message ?? error._tag }), {
			status: 422,
			headers: { "Content-Type": "application/json" },
		});
	}
	// Defensive fallback — typed errors above should cover all cases.
	return new Response(JSON.stringify({ error: "Internal Server Error" }), {
		status: 500,
		headers: { "Content-Type": "application/json" },
	});
};

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const postNoteHandler = (c: AnyContext) =>
	Effect.gen(function* () {
		const repo = yield* NoteRepository;
		const body = yield* Effect.promise(() => c.req.json<{ title: string; body?: string }>());
		const id = crypto.randomUUID();
		const note = yield* repo.create({
			id,
			title: body.title,
			// exactOptionalPropertyTypes: only include key when value is present
			...(body.body !== undefined ? { body: body.body } : {}),
		});
		return new Response(JSON.stringify(note), {
			status: 201,
			headers: { "Content-Type": "application/json" },
		});
	});

const getNoteByIdHandler = (c: AnyContext) =>
	Effect.gen(function* () {
		const repo = yield* NoteRepository;
		const id = c.req.param("id") as NoteId;
		const note = yield* repo.findById(id);
		return new Response(JSON.stringify(note), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	});

const listNotesHandler = (c: AnyContext) =>
	Effect.gen(function* () {
		const repo = yield* NoteRepository;
		const rawCursor = c.req.query("cursor");
		const limit = parseInt(c.req.query("limit") ?? "20", 10);
		const result = yield* repo.list({
			// exactOptionalPropertyTypes: only include key when value is present
			...(rawCursor !== undefined ? { cursor: rawCursor as NoteId } : {}),
			limit,
		});
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	});

const deleteNoteHandler = (c: AnyContext) =>
	Effect.gen(function* () {
		const repo = yield* NoteRepository;
		const id = c.req.param("id") as NoteId;
		yield* repo.delete(id);
		return new Response(null, { status: 204 });
	});

// ---------------------------------------------------------------------------
// App factory (parameterised over the NoteRepository layer)
// ---------------------------------------------------------------------------

export const buildNotesApp = (
	deps: Layer.Layer<NoteRepository> | ((c: AnyContext) => Layer.Layer<NoteRepository>),
) =>
	new Hono<{ Bindings: WorkerBindings }>()
		.post(
			"/notes",
			defineRoute({
				deps,
				onError: onNoteError,
				handler: postNoteHandler,
			}),
		)
		.get(
			"/notes/:id",
			defineRoute({
				deps,
				onError: onNoteError,
				handler: getNoteByIdHandler,
			}),
		)
		.get(
			"/notes",
			defineRoute({
				deps,
				onError: onNoteError,
				handler: listNotesHandler,
			}),
		)
		.delete(
			"/notes/:id",
			defineRoute({
				deps,
				onError: onNoteError,
				handler: deleteNoteHandler,
			}),
		);

// ---------------------------------------------------------------------------
// Live app — per-request D1-backed repository
// ---------------------------------------------------------------------------
const app = buildNotesApp((c) => makeNoteRepositoryLive(c.env.DB));

export const notesRoute = { app } satisfies RouteModule<typeof app>;
