import type { Command } from "commander";
import { login } from "../auth/oauth.js";
import { resolveAuth, resolveBaseUrl } from "../auth/resolve.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";

export function registerLoginCommand(program: Command): void {
	program
		.command("login")
		.description("Log in via browser (OAuth 2.1)")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const existing = resolveAuth();
				if (existing?.source === "oauth") {
					console.log("Already logged in. Run `affonso logout` first to switch accounts.");
					return;
				}

				const baseUrl = resolveBaseUrl(o.baseUrl);
				await login(baseUrl);
				console.log("Successfully logged in!");
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
