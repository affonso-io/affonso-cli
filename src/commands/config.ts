import type { Command } from "commander";
import { loadConfig, saveConfig } from "../auth/storage.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";

const VALID_KEYS = ["api-key", "base-url"] as const;
type ConfigKey = (typeof VALID_KEYS)[number];

const KEY_MAP: Record<ConfigKey, string> = {
	"api-key": "api_key",
	"base-url": "base_url",
};

export function registerConfigCommands(program: Command): void {
	const config = program.command("config").description("Manage CLI configuration");

	config
		.command("get <key>")
		.description("Get a config value (api-key, base-url)")
		.action(async function (this: Command, key: string) {
			const o = opts(this);
			try {
				if (!VALID_KEYS.includes(key as ConfigKey)) {
					console.error(`Unknown config key: ${key}. Valid keys: ${VALID_KEYS.join(", ")}`);
					process.exit(1);
				}

				const stored = loadConfig();
				const mappedKey = KEY_MAP[key as ConfigKey];
				const value = stored[mappedKey as keyof typeof stored];

				if (value) {
					if (key === "api-key") {
						// Mask the key
						const v = value as string;
						console.log(`${v.slice(0, 10)}...${v.slice(-4)}`);
					} else {
						console.log(value);
					}
				} else {
					console.log(`${key} is not set.`);
				}
			} catch (err) {
				handleError(err, o.json);
			}
		});

	config
		.command("set <key> <value>")
		.description("Set a config value (api-key, base-url)")
		.action(async function (this: Command, key: string, value: string) {
			const o = opts(this);
			try {
				if (!VALID_KEYS.includes(key as ConfigKey)) {
					console.error(`Unknown config key: ${key}. Valid keys: ${VALID_KEYS.join(", ")}`);
					process.exit(1);
				}

				const mappedKey = KEY_MAP[key as ConfigKey];
				saveConfig({ [mappedKey]: value });
				console.log(`${key} saved.`);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
