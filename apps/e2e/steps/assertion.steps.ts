import assert from "node:assert";
import { Then } from "@cucumber/cucumber";
import type { CucumberWorld } from "../support/world.ts";

Then("I should see {string}", async function (this: CucumberWorld, text: string) {
	await this.page.getByText(text).waitFor({ state: "visible", timeout: 5_000 });
});

Then("I should not see {string}", async function (this: CucumberWorld, text: string) {
	await this.page.getByText(text).waitFor({ state: "hidden", timeout: 5_000 });
});

Then("the URL should contain {string}", async function (this: CucumberWorld, substring: string) {
	assert.ok(
		this.page.url().includes(substring),
		`Expected URL "${this.page.url()}" to contain "${substring}"`,
	);
});
