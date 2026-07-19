import type { Command } from "commander";

export function opts(cmd: Command): ReturnType<Command["opts"]> {
	let current: Command | null = cmd;
	let merged = {};
	while (current) {
		merged = { ...current.opts(), ...merged };
		current = current.parent;
	}
	return merged;
}
