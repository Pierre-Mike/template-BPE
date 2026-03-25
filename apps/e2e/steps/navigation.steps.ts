import { Given } from "@cucumber/cucumber";
import type { CucumberWorld } from "../support/world.ts";

const FRONTEND_URL = "http://localhost:4321";

Given("I am on {string}", async function (this: CucumberWorld, path: string) {
	await this.page.goto(`${FRONTEND_URL}${path}`);
});
