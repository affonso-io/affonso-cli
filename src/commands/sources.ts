import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { parseJsonObject } from "../lib/parse.js";
import { output } from "../output/format.js";

export function registerSourceCommands(program: Command): void {
	program
		.command("sources")
		.description("Ingest source events")
		.command("ingest <source>")
		.description(
			"Ingest a signed source event (custom or segment_webhook; configure its signing-secret environment variable)",
		)
		.requiredOption("--payload-json <json|@file>", "Source payload as JSON or @file")
		.action(async function (this: Command, source: "custom" | "segment_webhook") {
			const o = opts(this);
			try {
				const payload = parseJsonObject(o.payloadJson, "--payload-json");
				if (!payload) throw new Error("--payload-json is required.");
				const client = await getClient(o);
				output(await client.sources.ingest(source, payload), o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
