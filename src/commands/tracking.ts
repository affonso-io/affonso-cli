import { Affonso } from "@affonso/sdk";
import type { Command } from "commander";
import { resolveBaseUrl } from "../auth/resolve.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { output } from "../output/format.js";

export function registerTrackingCommands(program: Command): void {
	program
		.command("tracking")
		.description("Track public referral traffic")
		.command("track")
		.description("Resolve and record a public tracking request")
		.requiredOption("--program-id <id>", "Program ID")
		.option("--tracking-id <id>", "Affiliate tracking ID")
		.option("--referrer <url>", "Referrer URL")
		.option("--user-agent <value>", "User agent")
		.option("--utm-source <value>", "UTM source")
		.option("--utm-medium <value>", "UTM medium")
		.option("--utm-campaign <value>", "UTM campaign")
		.option("--utm-term <value>", "UTM term")
		.option("--utm-content <value>", "UTM content")
		.option("--sub1 <value>", "Sub-tracking parameter 1")
		.option("--sub2 <value>", "Sub-tracking parameter 2")
		.option("--sub3 <value>", "Sub-tracking parameter 3")
		.option("--sub4 <value>", "Sub-tracking parameter 4")
		.option("--sub5 <value>", "Sub-tracking parameter 5")
		.option("--gclid <id>", "Google click ID")
		.option("--fbclid <id>", "Meta click ID")
		.option("--msclkid <id>", "Microsoft click ID")
		.option("--ttclid <id>", "TikTok click ID")
		.option("--has-consent", "Record that tracking consent was granted")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = new Affonso("public", { baseUrl: resolveBaseUrl(o.baseUrl) });
				output(
					await client.tracking.track({
						programId: o.programId,
						trackingId: o.trackingId,
						referrer: o.referrer,
						userAgent: o.userAgent,
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
						gclid: o.gclid,
						fbclid: o.fbclid,
						msclkid: o.msclkid,
						ttclid: o.ttclid,
						hasConsent: o.hasConsent || undefined,
					}),
					o,
				);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
