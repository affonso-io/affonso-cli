import type { EventCreateParams } from "@affonso/sdk";
import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { commaSeparated, parseJsonObject } from "../lib/parse.js";
import { output } from "../output/format.js";

export function registerEventCommands(program: Command): void {
	program
		.command("events")
		.description("Track server-side events")
		.command("create")
		.description("Create a server-side event (requires AFFONSO_SIGNING_SECRET)")
		.requiredOption("--event-name <name>", "Event name")
		.option("--event-type <type>", "Event type (conversion, lead, trial, milestone)")
		.option("--referral-id <id>", "Referral ID")
		.option("--click-id <id>", "Click ID")
		.option("--affonso-id <id>", "Affonso click ID")
		.option("--affonso-referral <id>", "Affonso referral identifier")
		.option("--customer-id <id>", "Customer ID")
		.option("--external-user-id <id>", "External user ID")
		.option("--occurred-at <date>", "Event timestamp (ISO 8601)")
		.option("--external-event-id <id>", "Idempotent external event ID")
		.option("--sale-amount <n>", "Sale amount")
		.option("--sale-amount-currency <code>", "Sale currency")
		.option("--product-ids <ids>", "Product IDs (comma-separated)")
		.option("--price-ids <ids>", "Price IDs (comma-separated)")
		.option("--interval <interval>", "Billing interval (monthly, yearly)")
		.option("--is-subscription", "Mark as a subscription")
		.option("--metadata-json <json|@file>", "Metadata as JSON or @file")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const params: EventCreateParams = {
					event_name: o.eventName,
					event_type: o.eventType,
					referral_id: o.referralId,
					click_id: o.clickId,
					affonso_id: o.affonsoId,
					affonso_referral: o.affonsoReferral,
					customer_id: o.customerId,
					external_user_id: o.externalUserId,
					occurred_at: o.occurredAt,
					external_event_id: o.externalEventId,
					sale_amount: o.saleAmount === undefined ? undefined : Number(o.saleAmount),
					sale_amount_currency: o.saleAmountCurrency,
					product_ids: commaSeparated(o.productIds),
					price_ids: commaSeparated(o.priceIds),
					interval: o.interval,
					is_subscription: o.isSubscription || undefined,
					metadata: parseJsonObject(o.metadataJson, "--metadata-json"),
				};
				const client = await getClient(o);
				output(await client.events.create(params), o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
