/**
 * Pure response-parsing helpers for the Notes Astro pages.
 *
 * These functions sit between the typed Hono RPC client and the Astro
 * templates so the UI logic can be unit-tested without a live server.
 */

export interface NoteItem {
	id: string;
	title: string;
	body?: string;
	createdAt: string;
}

export interface ListResult {
	items: NoteItem[];
	nextCursor: string | null;
	isEmpty: boolean;
}

export interface DetailResult {
	note: NoteItem | null;
	notFound: boolean;
}

export interface CreateResult {
	createdId: string | null;
	validationError: string | null;
}

/** Parse the JSON payload returned by `GET /notes`. */
export function parseListResponse(raw: {
	items: NoteItem[];
	nextCursor: string | null;
}): ListResult {
	return {
		items: raw.items,
		nextCursor: raw.nextCursor,
		isEmpty: raw.items.length === 0,
	};
}

/** Parse a `Response` from `GET /notes/:id`. */
export async function parseDetailResponse(res: Response): Promise<DetailResult> {
	if (!res.ok) {
		return { note: null, notFound: true };
	}
	const note = (await res.json()) as NoteItem;
	return { note, notFound: false };
}

/** Parse a `Response` from `POST /notes`. */
export async function parseCreateResponse(res: Response): Promise<CreateResult> {
	if (res.status === 422) {
		const body = (await res.json()) as { error: string };
		return { createdId: null, validationError: body.error };
	}
	if (res.status === 201) {
		const note = (await res.json()) as NoteItem;
		return { createdId: note.id, validationError: null };
	}
	return { createdId: null, validationError: "Unexpected error" };
}
