import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { output } from "../output/format.js";

export function registerSignupCommands(program: Command): void {
	program
		.command("signups")
		.description("Manage server-side signups")
		.command("create")
		.description("Create a server-side signup")
		.requiredOption("--click-id <id>", "Click ID")
		.option("--email <email>", "Customer email")
		.option("--external-user-id <id>", "External user ID")
		.option("--name <name>", "Customer name")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				output(
					await client.signups.create({
						click_id: o.clickId,
						email: o.email,
						external_user_id: o.externalUserId,
						name: o.name,
					}),
					o,
				);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
