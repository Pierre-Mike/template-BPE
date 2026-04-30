import { describe, expect, it } from "bun:test";
import { NOTES_MIGRATION } from "./note.migration.ts";

describe("D1 migration: 0001_create_notes.sql", () => {
	const migrationPath = new URL(`../../../../${NOTES_MIGRATION.FILE}`, import.meta.url);

	it("migration file exists", async () => {
		const file = Bun.file(migrationPath);
		expect(await file.exists()).toBe(true);
	});

	it("creates the notes table with IF NOT EXISTS guard", async () => {
		const sql = await Bun.file(migrationPath).text();
		expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS notes/i);
	});

	it("defines an id column as TEXT PRIMARY KEY", async () => {
		const sql = await Bun.file(migrationPath).text();
		expect(sql).toMatch(/\bid\s+TEXT\s+PRIMARY KEY/i);
	});

	it("defines a title column as TEXT NOT NULL", async () => {
		const sql = await Bun.file(migrationPath).text();
		expect(sql).toMatch(/\btitle\s+TEXT\s+NOT NULL/i);
	});

	it("defines a body column as TEXT (nullable)", async () => {
		const sql = await Bun.file(migrationPath).text();
		expect(sql).toMatch(/\bbody\s+TEXT/i);
	});

	it("defines a created_at column as TEXT NOT NULL", async () => {
		const sql = await Bun.file(migrationPath).text();
		expect(sql).toMatch(/\bcreated_at\s+TEXT\s+NOT NULL/i);
	});

	it("NOTES_MIGRATION.TABLE matches the table name in DDL", async () => {
		const sql = await Bun.file(migrationPath).text();
		expect(sql).toContain(NOTES_MIGRATION.TABLE);
	});

	it("NOTES_MIGRATION.COLUMNS keys are all present in DDL", async () => {
		const sql = await Bun.file(migrationPath).text();
		for (const col of Object.values(NOTES_MIGRATION.COLUMNS)) {
			expect(sql).toContain(col);
		}
	});
});
