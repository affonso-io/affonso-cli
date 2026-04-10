import { loadAuth, loadConfig } from "./storage.js";

export interface ResolvedAuth {
	apiKey: string;
	source: "flag" | "env" | "config" | "oauth";
}

export function resolveAuth(flagApiKey?: string): ResolvedAuth | null {
	// 1. --api-key flag (highest priority)
	if (flagApiKey) {
		return { apiKey: flagApiKey, source: "flag" };
	}

	// 2. AFFONSO_API_KEY env var
	const envKey = process.env.AFFONSO_API_KEY;
	if (envKey) {
		return { apiKey: envKey, source: "env" };
	}

	// 3. Stored config api_key
	const config = loadConfig();
	if (config.api_key) {
		return { apiKey: config.api_key, source: "config" };
	}

	// 4. Stored OAuth token
	const auth = loadAuth();
	if (auth?.access_token) {
		if (auth.expires_at && Date.now() > auth.expires_at) {
			// Token expired - caller should handle refresh
			return null;
		}
		return { apiKey: auth.access_token, source: "oauth" };
	}

	return null;
}

export function resolveBaseUrl(flagBaseUrl?: string): string {
	if (flagBaseUrl) return flagBaseUrl;

	const config = loadConfig();
	if (config.base_url) return config.base_url;

	return "https://api.affonso.io/v1";
}
