const BACKEND_URL = "http://localhost:8787";

interface Note {
	id: string;
	title: string;
	body?: string;
	createdAt: string;
}

export async function createNote(title: string, body?: string): Promise<Note> {
	const res = await fetch(`${BACKEND_URL}/notes`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title, ...(body !== undefined ? { body } : {}) }),
	});
	if (!res.ok) throw new Error(`Seed createNote failed: ${res.status}`);
	return res.json() as Promise<Note>;
}

export async function deleteNote(id: string): Promise<void> {
	const res = await fetch(`${BACKEND_URL}/notes/${id}`, {
		method: "DELETE",
	});
	if (res.status !== 204 && res.status !== 404) {
		throw new Error(`Seed deleteNote failed: ${res.status}`);
	}
}
