import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { After, AfterAll, Before, BeforeAll } from "@cucumber/cucumber";
import type { Browser } from "playwright";
import { chromium } from "playwright";
import { deleteNote } from "./seed.ts";
import type { CucumberWorld } from "./world.ts";

const BACKEND_URL = "http://localhost:8787";
const FRONTEND_URL = "http://localhost:4321";
const STARTUP_TIMEOUT = 30_000;
const POLL_INTERVAL = 500;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");

let backendProc: ChildProcess;
let frontendProc: ChildProcess;
let browser: Browser;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			/* server not ready */
		}
		await new Promise((r) => setTimeout(r, POLL_INTERVAL));
	}
	throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

BeforeAll(async () => {
	backendProc = spawn("bunx", ["wrangler", "dev", "--port", "8787"], {
		cwd: path.join(REPO_ROOT, "apps/backend"),
		stdio: "pipe",
	});

	frontendProc = spawn("bunx", ["astro", "dev", "--port", "4321"], {
		cwd: path.join(REPO_ROOT, "apps/frontend"),
		stdio: "pipe",
	});

	await Promise.all([
		waitForServer(`${BACKEND_URL}/health`, STARTUP_TIMEOUT),
		waitForServer(FRONTEND_URL, STARTUP_TIMEOUT),
	]);

	browser = await chromium.launch();
});

AfterAll(async () => {
	await browser?.close();
	backendProc?.kill("SIGTERM");
	frontendProc?.kill("SIGTERM");
});

Before(async function (this: CucumberWorld) {
	this.browser = browser;
	this.context = await browser.newContext();
	this.page = await this.context.newPage();
});

After(async function (this: CucumberWorld) {
	await this.page?.close();
	await this.context?.close();
	for (const id of this.seededNoteIds) {
		await deleteNote(id);
	}
	this.seededNoteIds = [];
});
