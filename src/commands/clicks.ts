import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { output } from "../output/format.js";

export function registerClickCommands(program: Command): void {
	const clicks = program.command("clicks").description("Track click events");

	clicks
		.command("create")
		.description("Record a click event")
		.requiredOption("--program-id <id>", "Program ID")
		.requiredOption("--tracking-id <id>", "Tracking ID")
		.option("--referrer <url>", "Referrer URL")
		.option("--utm-source <val>", "UTM source")
		.option("--utm-medium <val>", "UTM medium")
		.option("--utm-campaign <val>", "UTM campaign")
		.option("--utm-term <val>", "UTM term")
		.option("--utm-content <val>", "UTM content")
		.option("--sub1 <val>", "Sub-tracking parameter 1")
		.option("--sub2 <val>", "Sub-tracking parameter 2")
		.option("--sub3 <val>", "Sub-tracking parameter 3")
		.option("--sub4 <val>", "Sub-tracking parameter 4")
		.option("--sub5 <val>", "Sub-tracking parameter 5")
		.option("--ip <ip>", "IP address")
		.option("--user-agent <ua>", "User agent string")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.clicks.create({
					programId: o.programId,
					trackingId: o.trackingId,
					referrer: o.referrer,
					utmSource: o.utmSource,
					utmMedium: o.utmMedium,
					utmCampaign: o.utmCampaign,
					utmTerm: o.utmTerm,
					utmContent: o.utmContent,
					sub1: o.sub1,
					sub2: o.sub2,
					sub3: o.sub3,
					sub4: o.sub4,
					sub5: o.sub5,
					ip: o.ip,
					userAgent: o.userAgent,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
