import type { OnboardingQuestionInput } from "@affonso/sdk";
import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { parseJson } from "../lib/parse.js";
import { output, outputSuccess } from "../output/format.js";

function questions(value: string): OnboardingQuestionInput[] {
	const parsed = parseJson<OnboardingQuestionInput[]>(value, "--questions-json");
	if (!Array.isArray(parsed)) throw new Error("--questions-json must contain a JSON array.");
	return parsed;
}

export function registerOnboardingFormCommands(program: Command): void {
	const form = program.command("onboarding-form").description("Manage the onboarding form");

	form
		.command("get")
		.description("Get the onboarding form")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				output(await client.onboardingForm.retrieve(), o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	form
		.command("create")
		.description("Create the onboarding form")
		.requiredOption("--name <name>", "Form name")
		.requiredOption("--questions-json <json|@file>", "Questions array as JSON or @file")
		.option("--description <text>", "Form description")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const parsedQuestions = questions(o.questionsJson);
				const client = await getClient(o);
				output(
					await client.onboardingForm.create({
						name: o.name,
						description: o.description,
						questions: parsedQuestions,
					}),
					o,
				);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	form
		.command("update")
		.description("Update the onboarding form")
		.option("--name <name>", "Form name")
		.option("--description <text>", "Form description")
		.option("--questions-json <json|@file>", "Questions array as JSON or @file")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const parsedQuestions =
					o.questionsJson === undefined ? undefined : questions(o.questionsJson);
				const client = await getClient(o);
				output(
					await client.onboardingForm.update({
						name: o.name,
						description: o.description,
						questions: parsedQuestions,
					}),
					o,
				);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	form
		.command("delete")
		.description("Delete the onboarding form")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.onboardingForm.del();
				outputSuccess(result.message ?? "Onboarding form deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
