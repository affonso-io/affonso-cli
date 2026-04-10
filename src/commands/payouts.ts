import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { output } from "../output/format.js";

function opts(cmd: Command) {
	return { ...cmd.parent?.parent?.opts(), ...cmd.opts() };
}

export function registerPayoutCommands(program: Command): void {
	const payouts = program.command("payouts").description("Manage payouts");

	payouts
		.command("list")
		.description("List payouts")
		.option("--limit <n>", "Items per page", "50")
		.option("--page <n>", "Page number", "1")
		.option("--status <status>", "Filter by status (pending, processing, completed, failed, cancelled)")
		.option("--affiliate-id <id>", "Filter by affiliate ID")
		.option("--sort <field:dir>", "Sort")
		.option("--date-from <date>", "Filter from date")
		.option("--date-to <date>", "Filter to date")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.payouts.list({
					limit: Number(o.limit),
					page: Number(o.page),
					status: o.status,
					affiliateId: o.affiliateId,
					sort: o.sort,
					dateFrom: o.dateFrom,
					dateTo: o.dateTo,
				});
				output(result, o, ["id", "affiliate_id", "amount", "status", "payment_method", "created_at"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	payouts
		.command("get <id>")
		.description("Get a payout by ID")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.payouts.retrieve(id);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	payouts
		.command("update <id>")
		.description("Update a payout")
		.requiredOption("--status <status>", "Payout status")
		.option("--payment-method <method>", "Payment method")
		.option("--payment-reference <ref>", "Payment reference (e.g. transaction ID)")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.payouts.update(id, {
					status: o.status,
					paymentMethod: o.paymentMethod,
					paymentReference: o.paymentReference,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
