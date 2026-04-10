const NO_COLOR = process.env.NO_COLOR !== undefined || process.argv.includes("--no-color");

const dim = (s: string) => (NO_COLOR ? s : `\x1b[2m${s}\x1b[0m`);
const bold = (s: string) => (NO_COLOR ? s : `\x1b[1m${s}\x1b[0m`);

export function formatTable(
	data: Record<string, unknown>[],
	columns?: string[],
): string {
	if (data.length === 0) return "No results found.";

	const cols = columns ?? Object.keys(data[0]);

	// Calculate column widths
	const widths: Record<string, number> = {};
	for (const col of cols) {
		const header = col.toUpperCase().replace(/_/g, " ");
		widths[col] = header.length;
		for (const row of data) {
			const val = formatValue(row[col]);
			widths[col] = Math.max(widths[col], val.length);
		}
		// Cap column width
		widths[col] = Math.min(widths[col], 40);
	}

	// Header
	const header = cols.map((col) => {
		const label = col.toUpperCase().replace(/_/g, " ");
		return bold(label.padEnd(widths[col]));
	}).join("  ");

	// Rows
	const rows = data.map((row) =>
		cols.map((col) => {
			const val = formatValue(row[col]);
			const truncated = val.length > 40 ? `${val.slice(0, 37)}...` : val;
			return truncated.padEnd(widths[col]);
		}).join("  "),
	);

	return [header, dim("─".repeat(header.replace(/\x1b\[[0-9;]*m/g, "").length)), ...rows].join(
		"\n",
	);
}

function formatValue(val: unknown): string {
	if (val === null || val === undefined) return "—";
	if (val instanceof Date) return val.toISOString().split("T")[0];
	if (typeof val === "string") {
		// Format ISO dates as short dates
		if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return val.split("T")[0];
		return val;
	}
	if (typeof val === "boolean") return val ? "yes" : "no";
	if (typeof val === "object") return JSON.stringify(val);
	return String(val);
}

export function formatSingle(data: Record<string, unknown>): string {
	const entries = Object.entries(data);
	const maxKey = Math.max(...entries.map(([k]) => k.length));

	return entries
		.map(([key, val]) => {
			const label = bold(key.padEnd(maxKey));
			return `${label}  ${formatValue(val)}`;
		})
		.join("\n");
}
