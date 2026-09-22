import type {
	AffiliateCreateParams,
	AffiliateUpdateParams,
	OnboardingResponseSubmitParams,
	PartnershipStatus,
} from "@affonso/sdk";
import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { parseJson, parseJsonObject } from "../lib/parse.js";
import { output, outputSuccess } from "../output/format.js";

type CreateAffiliateParams = AffiliateCreateParams & { status?: PartnershipStatus };
type UpdateAffiliateParams = AffiliateUpdateParams & {
	invoice_details?: Record<string, unknown>;
};

export function registerAffiliateCommands(program: Command): void {
	const affiliates = program.command("affiliates").description("Manage affiliates");

	affiliates
		.command("list")
		.description("List affiliates")
		.option("--limit <n>", "Items per page", "50")
		.option("--page <n>", "Page number", "1")
		.option("--status <status>", "Filter by status (pending, approved, rejected)")
		.option("--search <query>", "Search by name or email")
		.option("--group-id <id>", "Filter by group ID")
		.option("--expand <fields>", "Expand fields (comma-separated)")
		.option("--sort <field:dir>", "Sort (e.g. createdAt:desc)")
		.option("--date-from <date>", "Filter from date")
		.option("--date-to <date>", "Filter to date")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.affiliates.list({
					limit: Number(o.limit),
					page: Number(o.page),
					partnership_status: o.status,
					search: o.search,
					group_id: o.groupId,
					expand: o.expand,
					sort: o.sort,
					dateFrom: o.dateFrom,
					dateTo: o.dateTo,
				});
				output(result, o, [
					"id",
					"name",
					"email",
					"partnership_status",
					"tracking_id",
					"created_at",
				]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("get <id>")
		.description("Get an affiliate by ID")
		.option("--expand <fields>", "Expand fields (comma-separated)")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.affiliates.retrieve(id, {
					expand: o.expand,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("create")
		.description("Create an affiliate")
		.requiredOption("--name <name>", "Affiliate name")
		.requiredOption("--email <email>", "Affiliate email")
		.option("--tracking-id <id>", "Custom tracking ID")
		.option("--group-id <id>", "Group ID")
		.option("--company-name <name>", "Company name")
		.option("--country-code <code>", "Country code")
		.option("--status <status>", "Partnership status (pending, approved, rejected)")
		.option("--onboarding-completed", "Mark onboarding as completed")
		.option("--payout-method <method>", "Payout method")
		.option("--payout-details-json <json|@file>", "Payout details as JSON or @file")
		.option("--external-user-id <id>", "External user ID")
		.option("--metadata-json <json|@file>", "Metadata as JSON or @file")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const params: CreateAffiliateParams = {
					name: o.name,
					email: o.email,
					tracking_id: o.trackingId,
					group_id: o.groupId,
					company_name: o.companyName,
					country_code: o.countryCode,
					status: o.status,
					onboarding_completed: o.onboardingCompleted || undefined,
					payout_method: o.payoutMethod,
					payout_details: parseJsonObject(o.payoutDetailsJson, "--payout-details-json"),
					external_user_id: o.externalUserId,
					metadata: parseJsonObject(o.metadataJson, "--metadata-json"),
				};
				const client = await getClient(o);
				const result = await client.affiliates.create(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("update <id>")
		.description("Update an affiliate")
		.option("--name <name>", "Affiliate name")
		.option("--email <email>", "Affiliate email")
		.option("--status <status>", "Status (pending, approved, rejected)")
		.option("--group-id <id>", "Group ID")
		.option("--company-name <name>", "Company name")
		.option("--country-code <code>", "Country code")
		.option("--invoice-details-json <json|@file>", "Invoice details as JSON or @file")
		.option("--payout-method <method>", "Payout method")
		.option("--payout-details-json <json|@file>", "Payout details as JSON or @file")
		.option("--external-user-id <id>", "External user ID")
		.option("--metadata-json <json|@file>", "Metadata as JSON or @file")
		.option("--onboarding-completed", "Mark onboarding as completed")
		.option("--no-onboarding-completed", "Mark onboarding as incomplete")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const params: UpdateAffiliateParams = {};
				if (o.name !== undefined) params.name = o.name;
				if (o.email !== undefined) params.email = o.email;
				if (o.status !== undefined) params.status = o.status;
				if (o.groupId !== undefined) params.group_id = o.groupId;
				if (o.companyName !== undefined) params.company_name = o.companyName;
				if (o.countryCode !== undefined) params.country_code = o.countryCode;
				if (o.invoiceDetailsJson !== undefined)
					params.invoice_details = parseJsonObject(o.invoiceDetailsJson, "--invoice-details-json");
				if (o.payoutMethod !== undefined) params.payout_method = o.payoutMethod;
				if (o.payoutDetailsJson !== undefined)
					params.payout_details = parseJsonObject(o.payoutDetailsJson, "--payout-details-json");
				if (o.externalUserId !== undefined) params.external_user_id = o.externalUserId;
				if (o.metadataJson !== undefined)
					params.metadata = parseJsonObject(o.metadataJson, "--metadata-json");
				if (o.onboardingCompleted !== undefined)
					params.onboarding_completed = o.onboardingCompleted;
				const client = await getClient(o);
				const result = await client.affiliates.update(id, params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("delete <id>")
		.description("Delete an affiliate")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.affiliates.del(id);
				outputSuccess(result.message ?? "Affiliate deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	const onboarding = affiliates
		.command("onboarding-responses")
		.description("Manage affiliate onboarding responses");

	onboarding
		.command("get <affiliate-id>")
		.description("Get an affiliate's onboarding responses")
		.action(async function (this: Command, affiliateId: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				output(await client.affiliates.retrieveOnboardingResponses(affiliateId), o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	onboarding
		.command("submit <affiliate-id>")
		.description("Submit an affiliate's onboarding responses")
		.requiredOption("--responses-json <json|@file>", "Response array as JSON or @file")
		.option("--mark-complete", "Mark onboarding as complete")
		.action(async function (this: Command, affiliateId: string) {
			const o = opts(this);
			try {
				const responses = parseJson<OnboardingResponseSubmitParams["responses"]>(
					o.responsesJson,
					"--responses-json",
				);
				if (!Array.isArray(responses))
					throw new Error("--responses-json must contain a JSON array.");
				const client = await getClient(o);
				output(
					await client.affiliates.submitOnboardingResponses(affiliateId, {
						responses,
						mark_complete: o.markComplete || undefined,
					}),
					o,
				);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	affiliates
		.command("portal-token <id>")
		.description("Create a portal login token for an affiliate")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				output(await client.affiliates.createPortalToken(id), o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
