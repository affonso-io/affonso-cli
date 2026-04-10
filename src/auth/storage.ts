import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CONFIG_DIR = path.join(os.homedir(), ".config", "affonso");
const AUTH_FILE = path.join(CONFIG_DIR, "auth.json");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface StoredAuth {
	access_token: string;
	refresh_token: string;
	expires_at: number;
	team_id?: string;
	team_name?: string;
}

export interface StoredConfig {
	api_key?: string;
	base_url?: string;
}

function ensureDir(): void {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, { recursive: true });
	}
}

export function loadAuth(): StoredAuth | null {
	try {
		if (!fs.existsSync(AUTH_FILE)) return null;
		const raw = fs.readFileSync(AUTH_FILE, "utf-8");
		return JSON.parse(raw) as StoredAuth;
	} catch {
		return null;
	}
}

export function saveAuth(auth: StoredAuth): void {
	ensureDir();
	fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), {
		mode: 0o600,
	});
}

export function clearAuth(): void {
	try {
		if (fs.existsSync(AUTH_FILE)) {
			fs.unlinkSync(AUTH_FILE);
		}
	} catch {
		// ignore
	}
}

export function loadConfig(): StoredConfig {
	try {
		if (!fs.existsSync(CONFIG_FILE)) return {};
		const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
		return JSON.parse(raw) as StoredConfig;
	} catch {
		return {};
	}
}

export function saveConfig(config: StoredConfig): void {
	ensureDir();
	const existing = loadConfig();
	const merged = { ...existing, ...config };
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), {
		mode: 0o600,
	});
}
