import type { ConversionCreateParams } from "@affonso/sdk";
import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { commaSeparated, parseJsonObject } from "../lib/parse.js";
import { output } from "../output/format.js";

export function registerConversionCommands(program: Command): void {
	const conversions = program.command("conversions").description("Track and refund conversions");

	conversions
		.command("create")
		.description("Create a conversion (requires AFFONSO_SIGNING_SECRET)")
		.requiredOption("--sale-amount <n>", "Sale amount")
		.requiredOption("--external-event-id <id>", "Idempotent external event ID")
		.option("--referral-id <id>", "Referral ID")
		.option("--click-id <id>", "Click ID")
		.option("--affonso-id <id>", "Affonso click ID")
		.option("--affonso-referral <id>", "Affonso referral identifier")
		.option("--customer-id <id>", "Customer ID")
		.option("--external-user-id <id>", "External user ID")
		.option("--sale-amount-currency <code>", "Sale currency")
		.option("--product-ids <ids>", "Product IDs (comma-separated)")
		.option("--price-ids <ids>", "Price IDs (comma-separated)")
		.option("--interval <interval>", "Billing interval (monthly, yearly)")
		.option("--is-subscription", "Mark as a subscription")
		.option("--created-at <date>", "Creation timestamp (ISO 8601)")
		.option("--status <status>", "Commission status")
		.option("--sales-status <status>", "Sales status")
		.option("--metadata-json <json|@file>", "Metadata as JSON or @file")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const params: ConversionCreateParams = {
					referral_id: o.referralId,
					click_id: o.clickId,
					affonso_id: o.affonsoId,
					affonso_referral: o.affonsoReferral,
					customer_id: o.customerId,
					external_user_id: o.externalUserId,
					sale_amount: Number(o.saleAmount),
					sale_amount_currency: o.saleAmountCurrency,
					product_ids: commaSeparated(o.productIds),
					price_ids: commaSeparated(o.priceIds),
					interval: o.interval,
					is_subscription: o.isSubscription || undefined,
					external_event_id: o.externalEventId,
					created_at: o.createdAt,
					status: o.status,
					sales_status: o.salesStatus,
					metadata: parseJsonObject(o.metadataJson, "--metadata-json"),
				};
				const client = await getClient(o);
				output(await client.conversions.create(params), o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	conversions
		.command("refund <id>")
		.description("Refund a conversion (requires AFFONSO_SIGNING_SECRET)")
		.option("--amount <n>", "Partial refund amount")
		.option("--currency <code>", "Refund currency")
		.option("--reason <reason>", "Refund reason")
		.option("--external-event-id <id>", "Idempotent external event ID")
		.option("--refunded-at <date>", "Refund timestamp (ISO 8601)")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				output(
					await client.conversions.refund(id, {
						amount: o.amount === undefined ? undefined : Number(o.amount),
						currency: o.currency,
						reason: o.reason,
						external_event_id: o.externalEventId,
						refunded_at: o.refundedAt,
					}),
					o,
				);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
