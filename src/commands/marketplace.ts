import type { Command } from "commander";
import { Affonso } from "@affonso/sdk";
import { handleError } from "../lib/errors.js";
import { output } from "../output/format.js";
import { resolveBaseUrl } from "../auth/resolve.js";

function opts(cmd: Command) {
	return { ...cmd.parent?.parent?.opts(), ...cmd.opts() };
}

export function registerMarketplaceCommands(program: Command): void {
	const marketplace = program
		.command("marketplace")
		.description("Browse the affiliate marketplace (public, no auth required)");

	marketplace
		.command("list")
		.description("List marketplace programs")
		.option("--limit <n>", "Items per page", "50")
		.option("--page <n>", "Page number", "1")
		.option("--category <cat>", "Filter by category")
		.option("--search <query>", "Search programs")
		.option("--sort <field:dir>", "Sort")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				// Marketplace is public — use a dummy key, SDK just needs a string
				const baseUrl = resolveBaseUrl(o.baseUrl);
				const client = new Affonso("public", { baseUrl });
				const result = await client.marketplace.list({
					limit: Number(o.limit),
					page: Number(o.page),
					category: o.category,
					search: o.search,
					sort: o.sort,
				});
				output(result, o, ["id", "name", "category", "commission_type", "commission_rate", "cookie_lifetime"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	marketplace
		.command("get <id>")
		.description("Get a marketplace program by ID")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const baseUrl = resolveBaseUrl(o.baseUrl);
				const client = new Affonso("public", { baseUrl });
				const result = await client.marketplace.retrieve(id);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
