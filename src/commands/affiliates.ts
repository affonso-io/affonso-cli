import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { output, outputSuccess } from "../output/format.js";

function opts(cmd: Command) {
	return { ...cmd.parent?.parent?.opts(), ...cmd.opts() };
}

export function registerAffiliateCommands(program: Command): void {
	const affiliates = program.command("affiliates").description("Manage affiliates");

	affiliates
		.command("list")
		.description("List affiliates")
		.option("--limit <n>", "Items per page", "50")
		.option("--page <n>", "Page number", "1")
		.option("--status <status>", "Filter by status (pending, approved, rejected)")
		.option("--search <query>", "Search by name or email")
		.option("--group-id <id>", "Filter by group ID")
		.option("--program-id <id>", "Filter by program ID")
		.option("--expand <fields>", "Expand fields (comma-separated)")
		.option("--sort <field:dir>", "Sort (e.g. createdAt:desc)")
		.option("--date-from <date>", "Filter from date")
		.option("--date-to <date>", "Filter to date")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.affiliates.list({
					limit: Number(o.limit),
					page: Number(o.page),
					partnership_status: o.status,
					search: o.search,
					group_id: o.groupId,
					program_id: o.programId,
					expand: o.expand,
					sort: o.sort,
					dateFrom: o.dateFrom,
					dateTo: o.dateTo,
				});
				output(result, o, ["id", "name", "email", "partnership_status", "tracking_id", "created_at"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("get <id>")
		.description("Get an affiliate by ID")
		.option("--expand <fields>", "Expand fields (comma-separated)")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.affiliates.retrieve(id, {
					expand: o.expand,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("create")
		.description("Create an affiliate")
		.requiredOption("--name <name>", "Affiliate name")
		.requiredOption("--email <email>", "Affiliate email")
		.requiredOption("--program-id <id>", "Program ID")
		.option("--tracking-id <id>", "Custom tracking ID")
		.option("--group-id <id>", "Group ID")
		.option("--company-name <name>", "Company name")
		.option("--country-code <code>", "Country code")
		.option("--external-user-id <id>", "External user ID")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.affiliates.create({
					name: o.name,
					email: o.email,
					program_id: o.programId,
					tracking_id: o.trackingId,
					group_id: o.groupId,
					company_name: o.companyName,
					country_code: o.countryCode,
					external_user_id: o.externalUserId,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("update <id>")
		.description("Update an affiliate")
		.option("--name <name>", "Affiliate name")
		.option("--email <email>", "Affiliate email")
		.option("--status <status>", "Status (pending, approved, rejected)")
		.option("--group-id <id>", "Group ID")
		.option("--company-name <name>", "Company name")
		.option("--country-code <code>", "Country code")
		.option("--external-user-id <id>", "External user ID")
		.option("--onboarding-completed", "Mark onboarding as completed")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.name) params.name = o.name;
				if (o.email) params.email = o.email;
				if (o.status) params.status = o.status;
				if (o.groupId) params.group_id = o.groupId;
				if (o.companyName) params.company_name = o.companyName;
				if (o.countryCode) params.country_code = o.countryCode;
				if (o.externalUserId) params.external_user_id = o.externalUserId;
				if (o.onboardingCompleted) params.onboarding_completed = true;
				const result = await client.affiliates.update(id, params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("delete <id>")
		.description("Delete an affiliate")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.affiliates.del(id);
				outputSuccess(result.message ?? "Affiliate deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
