import { Given } from "@cucumber/cucumber";
import { createNote } from "../support/seed.ts";
import type { CucumberWorld } from "../support/world.ts";

Given("a note exists with title {string}", async function (this: CucumberWorld, title: string) {
	const note = await createNote(title);
	this.seededNoteIds.push(note.id);
});
