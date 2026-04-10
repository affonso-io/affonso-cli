import type { Command } from "commander";
import { resolveAuth } from "../auth/resolve.js";
import { loadAuth } from "../auth/storage.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { output } from "../output/format.js";

export function registerWhoamiCommand(program: Command): void {
	program
		.command("whoami")
		.description("Show current authentication status")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const auth = resolveAuth(o.apiKey);

				if (!auth) {
					console.error("Not authenticated. Run `affonso login` or set AFFONSO_API_KEY.");
					process.exit(1);
				}

				const info: Record<string, unknown> = {
					auth_method: auth.source,
				};

				if (auth.source === "oauth") {
					const stored = loadAuth();
					if (stored?.team_id) info.team_id = stored.team_id;
					if (stored?.team_name) info.team_name = stored.team_name;
					if (stored?.expires_at) {
						info.token_expires = new Date(stored.expires_at).toISOString();
					}
				} else {
					// Mask the API key
					const key = auth.apiKey;
					info.api_key = `${key.slice(0, 10)}...${key.slice(-4)}`;
				}

				output(info, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
