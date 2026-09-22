import { readFileSync } from "node:fs";

function readJsonInput(value: string): string {
	if (!value.startsWith("@")) return value;

	const path = value.slice(1);
	if (!path) throw new Error("JSON file path must follow @.");
	return readFileSync(path, "utf8");
}

export function parseJson<T>(value: string, optionName: string): T {
	try {
		return JSON.parse(readJsonInput(value)) as T;
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid JSON for ${optionName}: ${detail}`);
	}
}

export function parseJsonObject(
	value: string | undefined,
	optionName: string,
): Record<string, unknown> | undefined {
	if (value === undefined) return undefined;
	const parsed = parseJson<unknown>(value, optionName);
	if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
		throw new Error(`${optionName} must contain a JSON object.`);
	}
	return parsed as Record<string, unknown>;
}

export function commaSeparated(value: string | undefined): string[] | undefined {
	if (value === undefined) return undefined;
	return value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}
