import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { output, outputSuccess } from "../output/format.js";

function opts(cmd: Command) {
	return { ...cmd.parent?.parent?.opts(), ...cmd.opts() };
}

export function registerCouponCommands(program: Command): void {
	const coupons = program.command("coupons").description("Manage coupons");

	coupons
		.command("list")
		.description("List coupons")
		.option("--limit <n>", "Items per page", "50")
		.option("--page <n>", "Page number", "1")
		.option("--affiliate-id <id>", "Filter by affiliate ID")
		.option("--program-id <id>", "Filter by program ID")
		.option("--search <query>", "Search by code")
		.option("--expand <fields>", "Expand fields")
		.option("--sort <field:dir>", "Sort")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.coupons.list({
					limit: Number(o.limit),
					page: Number(o.page),
					affiliate_id: o.affiliateId,
					program_id: o.programId,
					search: o.search,
					expand: o.expand,
					sort: o.sort,
				});
				output(result, o, ["id", "affiliate_id", "code", "discount_type", "discount_value", "duration", "created_at"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	coupons
		.command("get <id>")
		.description("Get a coupon by ID")
		.option("--expand <fields>", "Expand fields")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.coupons.retrieve(id, {
					expand: o.expand,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	coupons
		.command("create")
		.description("Create a coupon")
		.requiredOption("--affiliate-id <id>", "Affiliate ID")
		.requiredOption("--code <code>", "Coupon code")
		.requiredOption("--discount-type <type>", "Discount type (percentage, fixed)")
		.requiredOption("--discount-value <n>", "Discount value")
		.requiredOption("--duration <dur>", "Duration (forever, once, repeating)")
		.option("--duration-in-months <n>", "Duration in months (for repeating)")
		.option("--currency <code>", "Currency code")
		.option("--product-ids <ids>", "Product IDs (comma-separated)")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.coupons.create({
					affiliate_id: o.affiliateId,
					code: o.code,
					discount_type: o.discountType,
					discount_value: Number(o.discountValue),
					duration: o.duration,
					duration_in_months: o.durationInMonths ? Number(o.durationInMonths) : undefined,
					currency: o.currency,
					product_ids: o.productIds?.split(","),
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	coupons
		.command("delete <id>")
		.description("Delete a coupon")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.coupons.del(id);
				outputSuccess(result.message ?? "Coupon deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
