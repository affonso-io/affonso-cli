import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { output, outputSuccess } from "../output/format.js";

function opts(cmd: Command) {
	return { ...cmd.parent?.parent?.opts(), ...cmd.opts() };
}

export function registerCommissionCommands(program: Command): void {
	const commissions = program.command("commissions").description("Manage commissions");

	commissions
		.command("list")
		.description("List commissions")
		.option("--limit <n>", "Items per page", "50")
		.option("--page <n>", "Page number", "1")
		.option("--status <status>", "Filter by commission status")
		.option("--sales-status <status>", "Filter by sales status")
		.option("--referral-id <id>", "Filter by referral ID")
		.option("--affiliate-id <id>", "Filter by affiliate ID")
		.option("--expand <fields>", "Expand fields")
		.option("--sort <field:dir>", "Sort")
		.option("--date-from <date>", "Filter from date")
		.option("--date-to <date>", "Filter to date")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.commissions.list({
					limit: Number(o.limit),
					page: Number(o.page),
					status: o.status,
					sales_status: o.salesStatus,
					referral_id: o.referralId,
					affiliate_id: o.affiliateId,
					expand: o.expand,
					sort: o.sort,
					dateFrom: o.dateFrom,
					dateTo: o.dateTo,
				});
				output(result, o, [
					"id",
					"affiliate_id",
					"sale_amount",
					"sale_amount_currency",
					"commission_amount",
					"status",
					"created_at",
				]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	commissions
		.command("get <id>")
		.description("Get a commission by ID")
		.option("--expand <fields>", "Expand fields")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.commissions.retrieve(id, {
					expand: o.expand,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	commissions
		.command("create")
		.description("Create a commission")
		.requiredOption("--referral-id <id>", "Referral ID")
		.requiredOption("--sale-amount <n>", "Sale amount")
		.requiredOption("--sale-amount-currency <code>", "Sale currency (e.g. USD)")
		.requiredOption("--commission-amount <n>", "Commission amount")
		.requiredOption("--commission-currency <code>", "Commission currency")
		.option("--is-subscription", "Mark as subscription commission")
		.option("--status <status>", "Commission status")
		.option("--sales-status <status>", "Sales status")
		.option("--payment-intent-id <id>", "Payment intent ID")
		.option("--hold-period-days <n>", "Hold period in days")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.commissions.create({
					referral_id: o.referralId,
					sale_amount: Number(o.saleAmount),
					sale_amount_currency: o.saleAmountCurrency,
					commission_amount: Number(o.commissionAmount),
					commission_currency: o.commissionCurrency,
					is_subscription: o.isSubscription || undefined,
					status: o.status,
					sales_status: o.salesStatus,
					payment_intent_id: o.paymentIntentId,
					hold_period_days: o.holdPeriodDays ? Number(o.holdPeriodDays) : undefined,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	commissions
		.command("update <id>")
		.description("Update a commission")
		.option("--status <status>", "Commission status")
		.option("--sales-status <status>", "Sales status")
		.option("--hold-period-days <n>", "Hold period in days")
		.option("--sale-amount <n>", "Sale amount")
		.option("--sale-amount-currency <code>", "Sale currency")
		.option("--commission-amount <n>", "Commission amount")
		.option("--commission-currency <code>", "Commission currency")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.status) params.status = o.status;
				if (o.salesStatus) params.sales_status = o.salesStatus;
				if (o.holdPeriodDays) params.hold_period_days = Number(o.holdPeriodDays);
				if (o.saleAmount) params.sale_amount = Number(o.saleAmount);
				if (o.saleAmountCurrency) params.sale_amount_currency = o.saleAmountCurrency;
				if (o.commissionAmount) params.commission_amount = Number(o.commissionAmount);
				if (o.commissionCurrency) params.commission_currency = o.commissionCurrency;
				const result = await client.commissions.update(id, params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	commissions
		.command("delete <id>")
		.description("Delete a commission")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.commissions.del(id);
				outputSuccess(result.message ?? "Commission deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
