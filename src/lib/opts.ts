import type { Command } from "commander";

export function opts(cmd: Command): Record<string, string | boolean | undefined> {
	let current: Command | null = cmd;
	let merged = {};
	while (current) {
		merged = { ...current.opts(), ...merged };
		current = current.parent;
	}
	return merged as Record<string, string | boolean | undefined>;
}
