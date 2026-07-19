import { formatJson } from "./json.js";
import { formatSingle, formatTable } from "./table.js";

interface OutputOptions {
	json?: boolean;
}

interface PaginatedResponse {
	data: Record<string, unknown>[];
	pagination?: Record<string, unknown>;
	hasMore?: boolean;
}

export function output(result: unknown, opts: OutputOptions, columns?: string[]): void {
	if (opts.json) {
		console.log(formatJson(result));
		return;
	}

	// Paginated list response
	if (isPaginatedResponse(result)) {
		console.log(formatTable(result.data, columns));
		if (result.pagination) {
			const p = result.pagination;
			console.log(`\nPage ${p.page}/${p.total_pages} (${p.total} total)`);
		}
		return;
	}

	// Array of items
	if (Array.isArray(result)) {
		console.log(formatTable(result as Record<string, unknown>[], columns));
		return;
	}

	// Single object
	if (result && typeof result === "object") {
		console.log(formatSingle(result as Record<string, unknown>));
		return;
	}

	console.log(String(result));
}

function isPaginatedResponse(val: unknown): val is PaginatedResponse {
	return (
		val !== null &&
		typeof val === "object" &&
		"data" in val &&
		Array.isArray((val as PaginatedResponse).data)
	);
}

export function outputSuccess(message: string, opts: OutputOptions): void {
	if (opts.json) {
		console.log(formatJson({ success: true, message }));
	} else {
		console.log(message);
	}
}
