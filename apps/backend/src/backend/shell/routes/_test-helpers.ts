import { Effect, Context as EffectContext, Layer } from "effect";
import type { Hono } from "hono";
import { makeTestNoteRepository, NoteRepository } from "../../infra/note-repository.ts";
import type { WorkerBindings } from "../effect-handler.ts";

/**
 * Builds a fully isolated test app backed by an in-memory NoteRepository.
 *
 * The repository is built once per call so all requests within the same app
 * share a single in-memory store. Each call to buildTestApp produces an
 * independent store, giving per-suite isolation.
 */
export const buildTestApp = <T extends Hono<{ Bindings: WorkerBindings }>>(
	buildApp: (deps: Layer.Layer<NoteRepository>) => T,
): T => {
	const service = Effect.runSync(
		Layer.build(makeTestNoteRepository()).pipe(
			Effect.map((ctx) => EffectContext.get(ctx, NoteRepository)),
			Effect.scoped,
		),
	);
	return buildApp(Layer.succeed(NoteRepository, service));
};
