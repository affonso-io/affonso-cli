import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { output, outputSuccess } from "../output/format.js";

export function registerReferralCommands(program: Command): void {
	const referrals = program.command("referrals").description("Manage referrals");

	referrals
		.command("list")
		.description("List referrals")
		.option("--limit <n>", "Items per page", "50")
		.option("--starting-after <id>", "Cursor: fetch items after this ID")
		.option("--ending-before <id>", "Cursor: fetch items before this ID")
		.option("--affiliate-id <id>", "Filter by affiliate ID")
		.option("--status <status>", "Filter by status")
		.option("--order <dir>", "Order (asc, desc)")
		.option("--expand <fields>", "Expand fields")
		.option("--created-gte <date>", "Created after date")
		.option("--created-lte <date>", "Created before date")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.referrals.list({
					limit: Number(o.limit),
					starting_after: o.startingAfter,
					ending_before: o.endingBefore,
					affiliate_id: o.affiliateId,
					status: o.status,
					order: o.order,
					expand: o.expand,
					created_gte: o.createdGte,
					created_lte: o.createdLte,
				});
				output(result, o, ["id", "affiliate_id", "email", "status", "created_at"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	referrals
		.command("get <id>")
		.description("Get a referral by ID")
		.option("--expand <fields>", "Expand fields")
		.option("--include <fields>", "Include fields")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.referrals.retrieve(id, {
					expand: o.expand,
					include: o.include,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	referrals
		.command("create")
		.description("Create a referral")
		.requiredOption("--email <email>", "Referral email")
		.requiredOption("--affiliate-id <id>", "Affiliate ID")
		.option("--subscription-id <id>", "Subscription ID")
		.option("--customer-id <id>", "Customer ID")
		.option("--click-id <id>", "Click ID")
		.option("--status <status>", "Initial status")
		.option("--name <name>", "Referral name")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.referrals.create({
					email: o.email,
					affiliate_id: o.affiliateId,
					subscription_id: o.subscriptionId,
					customer_id: o.customerId,
					click_id: o.clickId,
					status: o.status,
					name: o.name,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	referrals
		.command("update <id>")
		.description("Update a referral")
		.option("--email <email>", "Referral email")
		.option("--status <status>", "Status")
		.option("--subscription-id <id>", "Subscription ID")
		.option("--customer-id <id>", "Customer ID")
		.option("--name <name>", "Referral name")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.email !== undefined) params.email = o.email;
				if (o.status !== undefined) params.status = o.status;
				if (o.subscriptionId !== undefined) params.subscription_id = o.subscriptionId;
				if (o.customerId !== undefined) params.customer_id = o.customerId;
				if (o.name !== undefined) params.name = o.name;
				const result = await client.referrals.update(id, params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	referrals
		.command("delete <id>")
		.description("Delete a referral")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.referrals.del(id);
				outputSuccess(result.message ?? "Referral deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
