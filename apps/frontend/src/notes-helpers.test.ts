/**
 * TDD: RED phase — tests for notes page helpers.
 *
 * Covers the pure response-parsing logic extracted from the Astro pages so
 * that each UI behaviour can be verified without a running server.
 */
import { describe, expect, it } from "bun:test";

// --- Cycle 1: parseListResponse ---
describe("parseListResponse", () => {
	it("returns empty items and null nextCursor for an empty list", async () => {
		const { parseListResponse } = await import("./notes-helpers.ts");
		const raw = { items: [], nextCursor: null };
		const result = parseListResponse(raw);
		expect(result.items).toEqual([]);
		expect(result.nextCursor).toBeNull();
	});

	it("returns items and nextCursor when present", async () => {
		const { parseListResponse } = await import("./notes-helpers.ts");
		const note = { id: "n1", title: "Hello", createdAt: new Date().toISOString() };
		const raw = { items: [note], nextCursor: "n1" };
		const result = parseListResponse(raw);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].title).toBe("Hello");
		expect(result.nextCursor).toBe("n1");
	});

	it("isEmpty is true when items array is empty", async () => {
		const { parseListResponse } = await import("./notes-helpers.ts");
		const result = parseListResponse({ items: [], nextCursor: null });
		expect(result.isEmpty).toBe(true);
	});

	it("isEmpty is false when items are present", async () => {
		const { parseListResponse } = await import("./notes-helpers.ts");
		const note = { id: "n1", title: "Hello", createdAt: new Date().toISOString() };
		const result = parseListResponse({ items: [note], nextCursor: null });
		expect(result.isEmpty).toBe(false);
	});
});

// --- Cycle 2: parseDetailResponse ---
describe("parseDetailResponse", () => {
	it("returns the note for a 200 response", async () => {
		const { parseDetailResponse } = await import("./notes-helpers.ts");
		const note = { id: "n1", title: "Hello", body: "World", createdAt: new Date().toISOString() };
		const fakeRes = new Response(JSON.stringify(note), { status: 200 });
		const result = await parseDetailResponse(fakeRes);
		expect(result.note?.title).toBe("Hello");
		expect(result.notFound).toBe(false);
	});

	it("sets notFound=true for a non-2xx response", async () => {
		const { parseDetailResponse } = await import("./notes-helpers.ts");
		const fakeRes = new Response(JSON.stringify({ error: "Note not found: n99" }), { status: 404 });
		const result = await parseDetailResponse(fakeRes);
		expect(result.note).toBeNull();
		expect(result.notFound).toBe(true);
	});
});

// --- Cycle 3: parseCreateResponse ---
describe("parseCreateResponse", () => {
	it("returns the created note id for a 201 response", async () => {
		const { parseCreateResponse } = await import("./notes-helpers.ts");
		const note = { id: "n1", title: "New", createdAt: new Date().toISOString() };
		const fakeRes = new Response(JSON.stringify(note), { status: 201 });
		const result = await parseCreateResponse(fakeRes);
		expect(result.createdId).toBe("n1");
		expect(result.validationError).toBeNull();
	});

	it("returns validationError for a 422 response", async () => {
		const { parseCreateResponse } = await import("./notes-helpers.ts");
		const fakeRes = new Response(JSON.stringify({ error: "Title too long" }), { status: 422 });
		const result = await parseCreateResponse(fakeRes);
		expect(result.createdId).toBeNull();
		expect(result.validationError).toBe("Title too long");
	});
});
