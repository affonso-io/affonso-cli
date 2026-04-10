import { AffonsoError } from "@affonso/sdk";

export function handleError(err: unknown, json?: boolean): never {
	if (err instanceof AffonsoError) {
		if (json) {
			console.error(
				JSON.stringify(
					{
						success: false,
						error: {
							code: err.code ?? "UNKNOWN",
							message: err.message,
							field: err.field,
							details: err.details,
						},
					},
					null,
					2,
				),
			);
		} else {
			const parts: string[] = [`Error: ${err.message}`];
			if (err.code) parts[0] += ` (${err.code})`;

			if (err.details && Array.isArray(err.details)) {
				for (const detail of err.details) {
					if (typeof detail === "object" && detail !== null) {
						const d = detail as { field?: string; message?: string };
						if (d.field && d.message) {
							parts.push(`  • ${d.field}: ${d.message}`);
						} else if (d.message) {
							parts.push(`  • ${d.message}`);
						}
					}
				}
			}

			console.error(parts.join("\n"));
		}

		if (err.status === 401) {
			console.error('\nRun `affonso login` or set AFFONSO_API_KEY.');
		}

		process.exit(1);
	}

	if (err instanceof Error) {
		if (json) {
			console.error(JSON.stringify({ success: false, error: { code: "CLI_ERROR", message: err.message } }, null, 2));
		} else {
			console.error(`Error: ${err.message}`);
		}
		process.exit(1);
	}

	console.error("An unknown error occurred");
	process.exit(1);
}
