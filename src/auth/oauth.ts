import crypto from "node:crypto";
import http from "node:http";
import { saveAuth } from "./storage.js";

export const CLIENT_ID = "d4e5f6a7-b8c9-4d0e-a1f2-b3c4d5e6f7a8";
const SCOPES = "read write";
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function base64url(buffer: Buffer): string {
	return buffer.toString("base64url");
}

function generatePKCE(): { verifier: string; challenge: string } {
	const verifier = base64url(crypto.randomBytes(32));
	const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
	return { verifier, challenge };
}

function getIssuerUrl(baseUrl: string): string {
	// Strip /v1 suffix to get the issuer URL
	return baseUrl.replace(/\/v1\/?$/, "");
}

export async function login(baseUrl: string): Promise<void> {
	const issuer = getIssuerUrl(baseUrl);
	const { verifier, challenge } = generatePKCE();

	return new Promise((resolve, reject) => {
		const server = http.createServer(async (req, res) => {
			const url = new URL(req.url ?? "/", "http://localhost");

			if (url.pathname !== "/callback") {
				res.writeHead(404);
				res.end("Not found");
				return;
			}

			const code = url.searchParams.get("code");
			const error = url.searchParams.get("error");

			if (error) {
				const desc = url.searchParams.get("error_description") ?? error;
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(errorPage(desc));
				server.close();
				reject(new Error(`OAuth error: ${desc}`));
				return;
			}

			if (!code) {
				res.writeHead(400, { "Content-Type": "text/html" });
				res.end(errorPage("No authorization code received"));
				server.close();
				reject(new Error("No authorization code received"));
				return;
			}

			try {
				const tokenRes = await fetch(`${issuer}/oauth/token`, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						grant_type: "authorization_code",
						code,
						redirect_uri: `http://localhost:${port}/callback`,
						client_id: CLIENT_ID,
						code_verifier: verifier,
					}),
				});

				if (!tokenRes.ok) {
					const err = await tokenRes.text();
					throw new Error(`Token exchange failed: ${err}`);
				}

				const tokens = (await tokenRes.json()) as {
					access_token: string;
					refresh_token: string;
					expires_in: number;
					team_id?: string;
					team_name?: string;
				};

				saveAuth({
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					expires_at: Date.now() + tokens.expires_in * 1000,
					team_id: tokens.team_id,
					team_name: tokens.team_name,
				});

				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(successPage());
				server.close();
				resolve();
			} catch (err) {
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(errorPage(err instanceof Error ? err.message : "Unknown error"));
				server.close();
				reject(err);
			}
		});

		let port: number;

		server.listen(0, "127.0.0.1", async () => {
			const addr = server.address();
			if (!addr || typeof addr === "string") {
				reject(new Error("Failed to start local server"));
				return;
			}
			port = addr.port;

			const authUrl = new URL(`${issuer}/oauth/authorize`);
			authUrl.searchParams.set("response_type", "code");
			authUrl.searchParams.set("client_id", CLIENT_ID);
			authUrl.searchParams.set("redirect_uri", `http://localhost:${port}/callback`);
			authUrl.searchParams.set("code_challenge", challenge);
			authUrl.searchParams.set("code_challenge_method", "S256");
			authUrl.searchParams.set("scope", SCOPES);

			console.log("Opening browser for authentication...");
			console.log(`If the browser doesn't open, visit:\n${authUrl.toString()}\n`);

			try {
				const open = (await import("open")).default;
				await open(authUrl.toString());
			} catch {
				// Browser open failed, user can use the printed URL
			}
		});

		setTimeout(() => {
			server.close();
			reject(new Error("Login timed out after 5 minutes"));
		}, LOGIN_TIMEOUT_MS);
	});
}

export async function refreshToken(baseUrl: string, refreshTokenValue: string): Promise<boolean> {
	const issuer = getIssuerUrl(baseUrl);

	try {
		const res = await fetch(`${issuer}/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: refreshTokenValue,
				client_id: CLIENT_ID,
			}),
		});

		if (!res.ok) return false;

		const tokens = (await res.json()) as {
			access_token: string;
			refresh_token: string;
			expires_in: number;
			team_id?: string;
			team_name?: string;
		};

		saveAuth({
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			expires_at: Date.now() + tokens.expires_in * 1000,
			team_id: tokens.team_id,
			team_name: tokens.team_name,
		});

		return true;
	} catch {
		return false;
	}
}

function successPage(): string {
	return `<!DOCTYPE html><html><body style="font-family:system-ui;text-align:center;padding:60px">
<h1>&#10003; Logged in to Affonso</h1>
<p>You can close this window and return to the terminal.</p>
</body></html>`;
}

function errorPage(message: string): string {
	return `<!DOCTYPE html><html><body style="font-family:system-ui;text-align:center;padding:60px">
<h1>Authentication Error</h1>
<p>${escapeHtml(message)}</p>
</body></html>`;
}
