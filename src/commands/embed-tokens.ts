import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { output } from "../output/format.js";

function opts(cmd: Command) {
	return { ...cmd.parent?.parent?.opts(), ...cmd.opts() };
}

export function registerEmbedTokenCommands(program: Command): void {
	const embedTokens = program.command("embed-tokens").description("Generate embed tokens");

	embedTokens
		.command("create")
		.description("Create an embed token")
		.option("--affiliate-id <id>", "Affiliate ID")
		.option("--external-user-id <id>", "External user ID")
		.option("--email <email>", "Partner email")
		.option("--name <name>", "Partner name")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.embedTokens.create({
					affiliate_id: o.affiliateId,
					external_user_id: o.externalUserId,
					email: o.email,
					name: o.name,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
