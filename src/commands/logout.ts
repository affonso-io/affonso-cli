import type { Command } from "commander";
import { CLIENT_ID } from "../auth/oauth.js";
import { resolveBaseUrl } from "../auth/resolve.js";
import { clearAuth, loadAuth } from "../auth/storage.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";

export function registerLogoutCommand(program: Command): void {
	program
		.command("logout")
		.description("Log out and remove stored credentials")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const auth = loadAuth();

				// Try to revoke token on the server
				if (auth?.access_token) {
					const baseUrl = resolveBaseUrl(o.baseUrl);
					const issuer = baseUrl.replace(/\/v1\/?$/, "");
					try {
						await fetch(`${issuer}/oauth/revoke`, {
							method: "POST",
							headers: { "Content-Type": "application/x-www-form-urlencoded" },
							body: new URLSearchParams({
								token: auth.access_token,
								client_id: CLIENT_ID,
							}),
						});
					} catch {
						// Revocation is best-effort
					}
				}

				clearAuth();
				console.log("Logged out.");
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
