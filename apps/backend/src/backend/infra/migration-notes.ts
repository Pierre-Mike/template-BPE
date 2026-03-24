/**
 * Canonical identifiers for the notes table D1 migration.
 * These constants serve as the single source of truth for column names
 * used in queries throughout makeNoteRepositoryLive, mirroring what is
 * defined in migrations/0001_create_notes.sql.
 */
export const NOTES_MIGRATION = {
	/** Migration filename relative to the backend package root */
	FILE: "migrations/0001_create_notes.sql",
	/** Table name used in all notes queries */
	TABLE: "notes",
	/** Column names expected by makeNoteRepositoryLive */
	COLUMNS: {
		ID: "id",
		TITLE: "title",
		BODY: "body",
		CREATED_AT: "created_at",
	},
} as const;
