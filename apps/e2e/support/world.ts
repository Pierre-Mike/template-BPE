import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";

export class CucumberWorld extends World {
	browser!: Browser;
	context!: BrowserContext;
	page!: Page;
	seededNoteIds: string[] = [];
}

setWorldConstructor(CucumberWorld);
