import { Affonso } from "@affonso/sdk";
import { resolveAuth, resolveBaseUrl } from "../auth/resolve.js";
import { loadAuth } from "../auth/storage.js";
import { refreshToken } from "../auth/oauth.js";

interface ClientOpts {
	apiKey?: string;
	baseUrl?: string;
}

export async function getClient(opts: ClientOpts): Promise<Affonso> {
	const baseUrl = resolveBaseUrl(opts.baseUrl);
	let auth = resolveAuth(opts.apiKey);

	// Try to refresh expired OAuth token
	if (!auth) {
		const stored = loadAuth();
		if (stored?.refresh_token) {
			const refreshed = await refreshToken(baseUrl, stored.refresh_token);
			if (refreshed) {
				auth = resolveAuth(opts.apiKey);
			} else {
				console.error("Error: Session expired and token refresh failed. Run `affonso login` to re-authenticate.");
				process.exit(1);
			}
		}
	}

	if (!auth) {
		console.error("Error: Authentication required. Run `affonso login` or set AFFONSO_API_KEY.");
		process.exit(1);
	}

	return new Affonso(auth.apiKey, { baseUrl });
}
