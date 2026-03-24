import { describe, expect, it } from "bun:test";
import { notesRoute } from "./notes-routes.ts";

// Minimal typed shapes for test assertions — avoids noPropertyAccessFromIndexSignature errors.
type NoteBody = { id: string; title: string; body?: string; createdAt: string };
type ErrorBody = { error: string };
type ListBody = { items: NoteBody[]; nextCursor: string | null };

// ---------------------------------------------------------------------------
// POST /notes
// ---------------------------------------------------------------------------
describe("POST /notes", () => {
	it("201 happy path — title only", async () => {
		const res = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Hello" }),
		});
		expect(res.status).toBe(201);
		const body = (await res.json()) as NoteBody;
		expect(typeof body.id).toBe("string");
		expect(body.title).toBe("Hello");
		expect(body.body).toBeUndefined();
		expect(typeof body.createdAt).toBe("string");
	});

	it("201 happy path — title and body", async () => {
		const res = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Hello", body: "World" }),
		});
		expect(res.status).toBe(201);
		const body = (await res.json()) as NoteBody;
		expect(body.title).toBe("Hello");
		expect(body.body).toBe("World");
	});

	it("422 for empty title", async () => {
		const res = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "" }),
		});
		expect(res.status).toBe(422);
		const body = (await res.json()) as ErrorBody;
		expect(typeof body.error).toBe("string");
	});

	it("422 for title longer than 100 chars", async () => {
		const res = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "a".repeat(101) }),
		});
		expect(res.status).toBe(422);
		const body = (await res.json()) as ErrorBody;
		expect(typeof body.error).toBe("string");
	});

	it("422 for body longer than 2000 chars", async () => {
		const res = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Valid", body: "b".repeat(2001) }),
		});
		expect(res.status).toBe(422);
		const body = (await res.json()) as ErrorBody;
		expect(typeof body.error).toBe("string");
	});
});

// ---------------------------------------------------------------------------
// GET /notes/:id
// ---------------------------------------------------------------------------
describe("GET /notes/:id", () => {
	it("200 happy path — returns the created note", async () => {
		const createRes = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Find me" }),
		});
		expect(createRes.status).toBe(201);
		const created = (await createRes.json()) as NoteBody;

		const res = await notesRoute.testApp.request(`/notes/${created.id}`);
		expect(res.status).toBe(200);
		const body = (await res.json()) as NoteBody;
		expect(body.id).toBe(created.id);
		expect(body.title).toBe("Find me");
	});

	it("404 for missing id", async () => {
		const res = await notesRoute.testApp.request("/notes/non-existent-id");
		expect(res.status).toBe(404);
		const body = (await res.json()) as ErrorBody;
		expect(typeof body.error).toBe("string");
	});
});

// ---------------------------------------------------------------------------
// GET /notes
// ---------------------------------------------------------------------------
describe("GET /notes", () => {
	it("200 with items/nextCursor shape", async () => {
		const res = await notesRoute.testApp.request("/notes");
		expect(res.status).toBe(200);
		const body = (await res.json()) as ListBody;
		expect(Array.isArray(body.items)).toBe(true);
		expect("nextCursor" in body).toBe(true);
	});

	it("supports limit query param", async () => {
		const app = notesRoute.testApp;

		for (let i = 1; i <= 3; i++) {
			await app.request("/notes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: `Limit test note ${i}` }),
			});
		}

		const res = await app.request("/notes?limit=2");
		expect(res.status).toBe(200);
		const body = (await res.json()) as ListBody;
		expect(body.items.length).toBeLessThanOrEqual(2);
	});

	it("returns nextCursor as null when no more pages", async () => {
		const res = await notesRoute.testApp.request("/notes?limit=100");
		expect(res.status).toBe(200);
		const body = (await res.json()) as ListBody;
		expect(body.nextCursor).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// DELETE /notes/:id
// ---------------------------------------------------------------------------
describe("DELETE /notes/:id", () => {
	it("204 happy path", async () => {
		const createRes = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Delete me" }),
		});
		expect(createRes.status).toBe(201);
		const created = (await createRes.json()) as NoteBody;

		const res = await notesRoute.testApp.request(`/notes/${created.id}`, {
			method: "DELETE",
		});
		expect(res.status).toBe(204);
	});

	it("404 for missing id", async () => {
		const res = await notesRoute.testApp.request("/notes/ghost-id", {
			method: "DELETE",
		});
		expect(res.status).toBe(404);
		const body = (await res.json()) as ErrorBody;
		expect(typeof body.error).toBe("string");
	});
});

// ---------------------------------------------------------------------------
// Live app uses D1 binding
// ---------------------------------------------------------------------------
describe("live app — uses per-request D1 binding", () => {
	// Minimal in-memory mock of the D1Database interface so we can test that
	// the live `app` routes through makeNoteRepositoryLive(c.env.DB).
	type MockRow = { id: string; title: string; body: string | null; created_at: string };

	const runInsert = (
		store: Map<string, MockRow>,
		values: unknown[],
	): { meta: { changes: number } } => {
		const [id, title, body, created_at] = values as [string, string, string | null, string];
		store.set(id, { id, title, body, created_at });
		return { meta: { changes: 1 } };
	};

	const runDelete = (
		store: Map<string, MockRow>,
		values: unknown[],
	): { meta: { changes: number } } => {
		const deleted = store.delete(values[0] as string);
		return { meta: { changes: deleted ? 1 : 0 } };
	};

	const makeMockD1 = () => {
		const store = new Map<string, MockRow>();
		return {
			prepare(query: string) {
				return {
					bind(...values: unknown[]) {
						return {
							first: async <T>(): Promise<T | null> => {
								if (query.includes("WHERE id = ?")) {
									return (store.get(values[0] as string) as T) ?? null;
								}
								return null;
							},
							all: async <T>(): Promise<{ results: T[] }> => ({
								results: Array.from(store.values()) as T[],
							}),
							run: async (): Promise<{ meta: { changes: number } }> => {
								if (query.startsWith("INSERT")) return runInsert(store, values);
								if (query.startsWith("DELETE")) return runDelete(store, values);
								return { meta: { changes: 0 } };
							},
						};
					},
				};
			},
		};
	};

	it("POST /notes returns 201 when DB binding is provided", async () => {
		const mockDB = makeMockD1();
		const res = await notesRoute.app.request(
			"/notes",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Live note" }),
			},
			{ DB: mockDB },
		);
		expect(res.status).toBe(201);
		const body = (await res.json()) as NoteBody;
		expect(body.title).toBe("Live note");
	});

	it("GET /notes/:id returns 200 for a note persisted via D1", async () => {
		const mockDB = makeMockD1();
		const createRes = await notesRoute.app.request(
			"/notes",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Persisted" }),
			},
			{ DB: mockDB },
		);
		const created = (await createRes.json()) as NoteBody;

		const getRes = await notesRoute.app.request(`/notes/${created.id}`, {}, { DB: mockDB });
		expect(getRes.status).toBe(200);
		const body = (await getRes.json()) as NoteBody;
		expect(body.id).toBe(created.id);
	});
});

// ---------------------------------------------------------------------------
// onError mapper coverage
// ---------------------------------------------------------------------------
describe("onError mapper", () => {
	it("NoteNotFound → 404 on GET", async () => {
		const res = await notesRoute.testApp.request("/notes/unknown-id");
		expect(res.status).toBe(404);
	});

	it("NoteNotFound → 404 on DELETE", async () => {
		const res = await notesRoute.testApp.request("/notes/unknown-id", {
			method: "DELETE",
		});
		expect(res.status).toBe(404);
	});

	it("NoteTitleTooLong → 422 on POST", async () => {
		const res = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "x".repeat(101) }),
		});
		expect(res.status).toBe(422);
	});

	it("NoteBodyTooLong → 422 on POST", async () => {
		const res = await notesRoute.testApp.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Valid", body: "y".repeat(2001) }),
		});
		expect(res.status).toBe(422);
	});
});
