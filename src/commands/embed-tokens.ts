import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { parseJsonObject } from "../lib/parse.js";
import { output } from "../output/format.js";

export function registerEmbedTokenCommands(program: Command): void {
	const embedTokens = program.command("embed-tokens").description("Generate embed tokens");

	embedTokens
		.command("create")
		.description("Create an embed token")
		.requiredOption("--email <email>", "Partner email")
		.option("--external-user-id <id>", "External user ID")
		.option("--name <name>", "Partner name")
		.option("--image <url>", "Partner image URL")
		.option("--group-id <id>", "Affiliate group ID")
		.option("--metadata-json <json|@file>", "Metadata as JSON or @file")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const metadata = parseJsonObject(o.metadataJson, "--metadata-json");
				const client = await getClient(o);
				const result = await client.embedTokens.create({
					partner: {
						email: o.email,
						name: o.name,
						image: o.image,
					},
					groupId: o.groupId,
					externalUserId: o.externalUserId,
					metadata,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
