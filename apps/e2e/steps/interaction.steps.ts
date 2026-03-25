import { When } from "@cucumber/cucumber";
import type { CucumberWorld } from "../support/world.ts";

When("I click {string}", async function (this: CucumberWorld, text: string) {
	await this.page
		.getByRole("button", { name: text })
		.or(this.page.getByRole("link", { name: text }))
		.click();
});

When(
	"I type {string} into {string}",
	// biome-ignore lint/complexity/useMaxParams: `this` is a TS type annotation, not a real param
	async function (this: CucumberWorld, value: string, label: string) {
		await this.page.getByLabel(label).fill(value);
	},
);

When("I press {string}", async function (this: CucumberWorld, key: string) {
	await this.page.keyboard.press(key);
});
