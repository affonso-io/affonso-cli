import type {
	CreativeCreateParams,
	FraudRulesUpdateParams,
	GroupUpdateParams,
	NotificationUpdateParams,
	PaymentTermsUpdateParams,
	PortalSettingsUpdateParams,
	ProgramSettingsUpdateParams,
	RestrictionsUpdateParams,
	TrackingSettingsUpdateParams,
} from "@affonso/sdk";
import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { commaSeparated, parseJson, parseJsonObject } from "../lib/parse.js";
import { output, outputSuccess } from "../output/format.js";

type CurrentProgramSettingsUpdateParams = ProgramSettingsUpdateParams & {
	customer_information_visibility?: "HIDDEN" | "NAME" | "EMAIL" | "NAME_AND_EMAIL";
};

type CurrentPaymentTermsUpdateParams = PaymentTermsUpdateParams & {
	custom_payment_terms?: string | null;
};

export function registerProgramCommands(program: Command): void {
	const prog = program.command("program").description("Manage program settings");

	// program get
	prog
		.command("get")
		.description("Get program settings")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.retrieve();
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	// program update
	prog
		.command("update")
		.description("Update program settings")
		.option("--name <name>", "Program name")
		.option("--tagline <text>", "Tagline")
		.option("--description <text>", "Description")
		.option("--website-url <url>", "Website URL")
		.option("--logo-url <url>", "Logo URL")
		.option("--access-mode <mode>", "Access mode: PUBLIC, PRIVATE, or INVITE")
		.option("--affiliate-links-enabled", "Enable affiliate links")
		.option("--no-affiliate-links-enabled", "Disable affiliate links")
		.option(
			"--customer-information-visibility <visibility>",
			"Customer data visibility (HIDDEN, NAME, EMAIL, NAME_AND_EMAIL)",
		)
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: CurrentProgramSettingsUpdateParams = {};
				if (o.name !== undefined) params.name = o.name;
				if (o.tagline !== undefined) params.tagline = o.tagline;
				if (o.description !== undefined) params.description = o.description;
				if (o.websiteUrl !== undefined) params.website_url = o.websiteUrl;
				if (o.logoUrl !== undefined) params.logo_url = o.logoUrl;
				if (o.accessMode !== undefined) params.access_mode = o.accessMode;
				if (o.affiliateLinksEnabled !== undefined)
					params.affiliate_links_enabled = o.affiliateLinksEnabled;
				if (o.customerInformationVisibility !== undefined)
					params.customer_information_visibility = o.customerInformationVisibility;
				const result = await client.program.update(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	// payment-terms
	registerPaymentTerms(prog);
	// tracking
	registerTracking(prog);
	// restrictions
	registerRestrictions(prog);
	// fraud-rules
	registerFraudRules(prog);
	// portal
	registerPortal(prog);
	// notifications
	registerNotifications(prog);
	// groups
	registerGroups(prog);
	// creatives
	registerCreatives(prog);
}

function registerPaymentTerms(prog: Command): void {
	const pt = prog.command("payment-terms").description("Manage payment terms");

	pt.command("get")
		.description("Get payment terms")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.paymentTerms.retrieve();
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	pt.command("update")
		.description("Update payment terms")
		.option("--commission-type <type>", "Commission type (PERCENTAGE, FIXED, CREDITS)")
		.option("--commission-rate <n>", "Commission rate")
		.option("--commission-duration <dur>", "Duration (lifetime, time_limited, payment_limited)")
		.option("--commissions-limit <n>", "Commission duration limit")
		.option("--commissions-hold-days <n>", "Commission hold period in days")
		.option("--payment-threshold <n>", "Minimum payout threshold")
		.option("--payment-frequency <freq>", "Payment frequency (weekly, monthly)")
		.option("--payment-methods <methods>", "Payment methods (comma-separated)")
		.option("--custom-payment-terms <text>", "Custom payment terms")
		.option("--cookie-lifetime <days>", "Cookie lifetime in days")
		.option("--auto-payout", "Enable auto payout")
		.option("--no-auto-payout", "Disable auto payout")
		.option(
			"--invoice-rule <rule>",
			"Invoice rule (NONE, OWNER_PROVIDES, AFFILIATE_PROVIDES, SELF_BILLING)",
		)
		.option("--invoice-prefix <prefix>", "Invoice number prefix")
		.option("--require-tax-forms", "Require tax forms")
		.option("--no-require-tax-forms", "Do not require tax forms")
		.option("--owner-company-name <name>", "Owner company name")
		.option("--owner-address-line-1 <value>", "Owner address line 1")
		.option("--owner-address-line-2 <value>", "Owner address line 2")
		.option("--owner-city <city>", "Owner city")
		.option("--owner-postal-code <code>", "Owner postal code")
		.option("--owner-country <code>", "Owner country code")
		.option("--owner-vat-id <id>", "Owner VAT ID")
		.option("--owner-vat-rate <n>", "Owner VAT rate")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: CurrentPaymentTermsUpdateParams = {};
				if (o.commissionType !== undefined) params.commission_type = o.commissionType;
				if (o.commissionRate !== undefined) params.commission_rate = Number(o.commissionRate);
				if (o.commissionDuration !== undefined) params.commission_duration = o.commissionDuration;
				if (o.commissionsLimit !== undefined) params.commissions_limit = Number(o.commissionsLimit);
				if (o.commissionsHoldDays !== undefined)
					params.commissions_hold_days = Number(o.commissionsHoldDays);
				if (o.paymentThreshold !== undefined) params.payment_threshold = Number(o.paymentThreshold);
				if (o.paymentFrequency !== undefined) params.payment_frequency = o.paymentFrequency;
				if (o.paymentMethods !== undefined)
					params.payment_methods = commaSeparated(o.paymentMethods) ?? [];
				if (o.customPaymentTerms !== undefined) params.custom_payment_terms = o.customPaymentTerms;
				if (o.cookieLifetime !== undefined) params.cookie_lifetime = Number(o.cookieLifetime);
				if (o.autoPayout !== undefined) params.auto_payout = o.autoPayout;
				if (o.invoiceRule !== undefined) params.invoice_rule = o.invoiceRule;
				if (o.invoicePrefix !== undefined) params.invoice_prefix = o.invoicePrefix;
				if (o.requireTaxForms !== undefined) params.require_tax_forms = o.requireTaxForms;
				if (o.ownerCompanyName !== undefined) params.owner_company_name = o.ownerCompanyName;
				if (o.ownerAddressLine1 !== undefined) params.owner_address_line_1 = o.ownerAddressLine1;
				if (o.ownerAddressLine2 !== undefined) params.owner_address_line_2 = o.ownerAddressLine2;
				if (o.ownerCity !== undefined) params.owner_city = o.ownerCity;
				if (o.ownerPostalCode !== undefined) params.owner_postal_code = o.ownerPostalCode;
				if (o.ownerCountry !== undefined) params.owner_country = o.ownerCountry;
				if (o.ownerVatId !== undefined) params.owner_vat_id = o.ownerVatId;
				if (o.ownerVatRate !== undefined) params.owner_vat_rate = Number(o.ownerVatRate);
				const result = await client.program.paymentTerms.update(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}

function registerTracking(prog: Command): void {
	const tracking = prog.command("tracking").description("Manage tracking settings");

	tracking
		.command("get")
		.description("Get tracking settings")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.tracking.retrieve();
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	tracking
		.command("update")
		.description("Update tracking settings")
		.option("--default-referral-parameter <param>", "Default referral parameter")
		.option("--enabled-referral-parameters <params>", "Enabled parameters (comma-separated)")
		.option("--email-tracking-enabled", "Enable email tracking")
		.option("--no-email-tracking-enabled", "Disable email tracking")
		.option("--name-tracking-enabled", "Enable name tracking")
		.option("--no-name-tracking-enabled", "Disable name tracking")
		.option("--postbacks-enabled", "Enable postbacks")
		.option("--no-postbacks-enabled", "Disable postbacks")
		.option("--append-affonso-id-enabled", "Append the Affonso click ID")
		.option("--no-append-affonso-id-enabled", "Do not append the Affonso click ID")
		.option("--tracking-template-enabled", "Enable the tracking template")
		.option("--no-tracking-template-enabled", "Disable the tracking template")
		.option("--tracking-template-json <json|@file>", "Tracking template array as JSON or @file")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const params: TrackingSettingsUpdateParams = {};
				if (o.defaultReferralParameter !== undefined)
					params.default_referral_parameter = o.defaultReferralParameter;
				if (o.enabledReferralParameters !== undefined)
					params.enabled_referral_parameters = commaSeparated(o.enabledReferralParameters) ?? [];
				if (o.emailTrackingEnabled !== undefined)
					params.email_tracking_enabled = o.emailTrackingEnabled;
				if (o.nameTrackingEnabled !== undefined)
					params.name_tracking_enabled = o.nameTrackingEnabled;
				if (o.postbacksEnabled !== undefined) params.postbacks_enabled = o.postbacksEnabled;
				if (o.appendAffonsoIdEnabled !== undefined)
					params.append_affonso_id_enabled = o.appendAffonsoIdEnabled;
				if (o.trackingTemplateEnabled !== undefined)
					params.tracking_template_enabled = o.trackingTemplateEnabled;
				if (o.trackingTemplateJson !== undefined) {
					const template = parseJson<
						NonNullable<TrackingSettingsUpdateParams["tracking_template"]>
					>(o.trackingTemplateJson, "--tracking-template-json");
					if (!Array.isArray(template))
						throw new Error("--tracking-template-json must contain a JSON array.");
					params.tracking_template = template;
				}
				const client = await getClient(o);
				const result = await client.program.tracking.update(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}

function registerRestrictions(prog: Command): void {
	const restrictions = prog.command("restrictions").description("Manage traffic restrictions");

	restrictions
		.command("get")
		.description("Get restrictions")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.restrictions.retrieve();
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	restrictions
		.command("update")
		.description("Update restrictions")
		.option("--websites", "Allow websites")
		.option("--no-websites", "Disallow websites")
		.option("--social-marketing", "Allow social marketing")
		.option("--no-social-marketing", "Disallow social marketing")
		.option("--organic-social", "Allow organic social")
		.option("--no-organic-social", "Disallow organic social")
		.option("--email-marketing", "Allow email marketing")
		.option("--no-email-marketing", "Disallow email marketing")
		.option("--mobile-traffic", "Allow mobile traffic")
		.option("--no-mobile-traffic", "Disallow mobile traffic")
		.option("--search-engine-marketing", "Allow search engine marketing")
		.option("--no-search-engine-marketing", "Disallow search engine marketing")
		.option("--organic-search", "Allow organic search")
		.option("--no-organic-search", "Disallow organic search")
		.option("--rebrokering", "Allow rebrokering")
		.option("--no-rebrokering", "Disallow rebrokering")
		.option("--incent", "Allow incentivized traffic")
		.option("--no-incent", "Disallow incentivized traffic")
		.option("--brand-bidding", "Allow brand bidding")
		.option("--no-brand-bidding", "Disallow brand bidding")
		.option("--additional-restrictions <text>", "Additional restriction text")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: RestrictionsUpdateParams = {};
				const fieldMap: Array<[string, keyof RestrictionsUpdateParams]> = [
					["websites", "websites"],
					["socialMarketing", "social_marketing"],
					["organicSocial", "organic_social"],
					["emailMarketing", "email_marketing"],
					["mobileTraffic", "mobile_traffic"],
					["searchEngineMarketing", "search_engine_marketing"],
					["organicSearch", "organic_search"],
					["rebrokering", "rebrokering"],
					["incent", "incent"],
					["brandBidding", "brand_bidding"],
				];
				for (const [camel, snake] of fieldMap) {
					const val = o[camel];
					if (val !== undefined) params[snake] = val as never;
				}
				if (o.additionalRestrictions !== undefined)
					params.additional_restrictions = o.additionalRestrictions;
				const result = await client.program.restrictions.update(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}

function registerFraudRules(prog: Command): void {
	const fraud = prog.command("fraud-rules").description("Manage fraud detection rules");

	fraud
		.command("get")
		.description("Get fraud rules")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.fraudRules.retrieve();
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	fraud
		.command("update")
		.description("Update fraud rules")
		.option("--self-referral-mode <mode>", "Self-referral mode (off, detect, block)")
		.option("--cross-program-ban-mode <mode>", "Cross-program ban mode")
		.option("--duplicate-payout-mode <mode>", "Duplicate payout mode")
		.option("--suspicious-email-mode <mode>", "Suspicious email mode")
		.option("--banned-referral-mode <mode>", "Banned referral mode")
		.option("--paid-traffic-mode <mode>", "Paid traffic mode")
		.option("--blocked-country-mode <mode>", "Blocked country mode")
		.option("--banned-referral-config-json <json|@file>", "Banned referral config")
		.option("--paid-traffic-config-json <json|@file>", "Paid traffic config")
		.option("--blocked-country-config-json <json|@file>", "Blocked country config")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const params: FraudRulesUpdateParams = {};
				if (o.selfReferralMode !== undefined) params.self_referral_mode = o.selfReferralMode;
				if (o.crossProgramBanMode !== undefined)
					params.cross_program_ban_mode = o.crossProgramBanMode;
				if (o.duplicatePayoutMode !== undefined)
					params.duplicate_payout_mode = o.duplicatePayoutMode;
				if (o.suspiciousEmailMode !== undefined)
					params.suspicious_email_mode = o.suspiciousEmailMode;
				if (o.bannedReferralMode !== undefined) params.banned_referral_mode = o.bannedReferralMode;
				if (o.paidTrafficMode !== undefined) params.paid_traffic_mode = o.paidTrafficMode;
				if (o.blockedCountryMode !== undefined) params.blocked_country_mode = o.blockedCountryMode;
				if (o.bannedReferralConfigJson !== undefined)
					params.banned_referral_config = parseJsonObject(
						o.bannedReferralConfigJson,
						"--banned-referral-config-json",
					);
				if (o.paidTrafficConfigJson !== undefined)
					params.paid_traffic_config = parseJsonObject(
						o.paidTrafficConfigJson,
						"--paid-traffic-config-json",
					);
				if (o.blockedCountryConfigJson !== undefined)
					params.blocked_country_config = parseJsonObject(
						o.blockedCountryConfigJson,
						"--blocked-country-config-json",
					);
				const client = await getClient(o);
				const result = await client.program.fraudRules.update(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}

function registerPortal(prog: Command): void {
	const portal = prog.command("portal").description("Manage affiliate portal settings");

	portal
		.command("get")
		.description("Get portal settings")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.portal.retrieve();
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	portal
		.command("update")
		.description("Update portal settings")
		.option("--single-program-portal", "Enable the single-program portal")
		.option("--no-single-program-portal", "Disable the single-program portal")
		.option("--hide-branding", "Hide Affonso branding")
		.option("--no-hide-branding", "Show Affonso branding")
		.option("--hide-details", "Hide program details")
		.option("--no-hide-details", "Show program details")
		.option("--primary-color <color>", "Primary color (hex)")
		.option("--secondary-color <color>", "Secondary color (hex)")
		.option("--show-leaderboard", "Show the leaderboard")
		.option("--no-show-leaderboard", "Hide the leaderboard")
		.option("--terms-conditions-status", "Enable terms and conditions")
		.option("--no-terms-conditions-status", "Disable terms and conditions")
		.option("--terms-conditions-value <value>", "Terms text or URL")
		.option("--privacy-policy-status", "Enable the privacy policy")
		.option("--no-privacy-policy-status", "Disable the privacy policy")
		.option("--privacy-policy-value <value>", "Privacy policy text or URL")
		.option("--support-email-status", "Show the support email")
		.option("--no-support-email-status", "Hide the support email")
		.option("--support-email-value <email>", "Support email")
		.option("--custom-texts-json <json|@file>", "Custom texts as JSON or @file")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const params: PortalSettingsUpdateParams = {};
				if (o.singleProgramPortal !== undefined)
					params.single_program_portal = o.singleProgramPortal;
				if (o.hideBranding !== undefined) params.hide_branding = o.hideBranding;
				if (o.hideDetails !== undefined) params.hide_details = o.hideDetails;
				if (o.primaryColor !== undefined) params.primary_color = o.primaryColor;
				if (o.secondaryColor !== undefined) params.secondary_color = o.secondaryColor;
				if (o.showLeaderboard !== undefined) params.show_leaderboard = o.showLeaderboard;
				if (o.termsConditionsStatus !== undefined)
					params.terms_conditions_status = o.termsConditionsStatus;
				if (o.termsConditionsValue !== undefined)
					params.terms_conditions_value = o.termsConditionsValue;
				if (o.privacyPolicyStatus !== undefined)
					params.privacy_policy_status = o.privacyPolicyStatus;
				if (o.privacyPolicyValue !== undefined) params.privacy_policy_value = o.privacyPolicyValue;
				if (o.supportEmailStatus !== undefined) params.support_email_status = o.supportEmailStatus;
				if (o.supportEmailValue !== undefined) params.support_email_value = o.supportEmailValue;
				if (o.customTextsJson !== undefined)
					params.custom_texts = parseJsonObject(o.customTextsJson, "--custom-texts-json");
				const client = await getClient(o);
				const result = await client.program.portal.update(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}

function registerNotifications(prog: Command): void {
	const notifications = prog.command("notifications").description("Manage email notifications");

	notifications
		.command("list")
		.description("List notification settings")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.notifications.list();
				output(result, o, ["email_type_id", "is_active", "custom_subject", "custom_body"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	notifications
		.command("update <id>")
		.description("Update a notification setting")
		.option("--custom-subject <text>", "Custom email subject")
		.option("--custom-body <text>", "Custom email body")
		.option("--active", "Enable notification")
		.option("--no-active", "Disable notification")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: NotificationUpdateParams = {};
				if (o.customSubject !== undefined) params.custom_subject = o.customSubject;
				if (o.customBody !== undefined) params.custom_body = o.customBody;
				if (o.active !== undefined) params.is_active = o.active;
				const result = await client.program.notifications.update(id, params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}

function registerGroups(prog: Command): void {
	const groups = prog.command("groups").description("Manage affiliate groups");

	groups
		.command("list")
		.description("List groups")
		.option("--expand <fields>", "Expand fields (incentives, multi_level_incentives)")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.groups.list({
					expand: o.expand as string | undefined,
				});
				output(result, o, [
					"id",
					"name",
					"description",
					"custom_website_url",
					"is_default",
					"created_at",
				]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	groups
		.command("get <id>")
		.description("Get a group by ID")
		.option("--expand <fields>", "Expand fields")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.groups.retrieve(id, {
					expand: o.expand as string | undefined,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	groups
		.command("create")
		.description("Create a group")
		.requiredOption("--name <name>", "Group name")
		.option("--description <text>", "Group description")
		.option("--custom-website-url <url>", "Custom website URL")
		.option("--is-default", "Set as default group")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.groups.create({
					name: o.name as string,
					description: o.description as string | undefined,
					custom_website_url: o.customWebsiteUrl as string | undefined,
					is_default: o.isDefault as boolean | undefined,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	groups
		.command("update <id>")
		.description("Update a group")
		.option("--name <name>", "Group name")
		.option("--description <text>", "Group description")
		.option("--custom-website-url <url>", "Custom website URL")
		.option("--is-default", "Set as default group")
		.option("--no-is-default", "Unset as default group")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: GroupUpdateParams = {};
				if (o.name !== undefined) params.name = o.name;
				if (o.description !== undefined) params.description = o.description;
				if (o.customWebsiteUrl !== undefined) params.custom_website_url = o.customWebsiteUrl;
				if (o.isDefault !== undefined) params.is_default = o.isDefault;
				const result = await client.program.groups.update(id, params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	groups
		.command("delete <id>")
		.description("Delete a group")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.groups.del(id);
				outputSuccess(result.message ?? "Group deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}

function registerCreatives(prog: Command): void {
	const creatives = prog.command("creatives").description("Manage creatives");

	creatives
		.command("list")
		.description("List creatives")
		.option("--limit <n>", "Items per page", "50")
		.option("--page <n>", "Page number", "1")
		.option("--category <category>", "Filter by category")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.creatives.list({
					limit: Number(o.limit),
					page: Number(o.page),
					category: o.category as string | undefined,
				});
				output(result, o, ["id", "name", "category", "url", "created_at"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	creatives
		.command("get <id>")
		.description("Get a creative by ID")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.creatives.retrieve(id);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	creatives
		.command("create")
		.description("Create a creative")
		.option("--name <name>", "Creative name")
		.option("--category <category>", "Creative category")
		.option("--subcategory <subcategory>", "Creative subcategory")
		.option("--description <text>", "Description")
		.option("--url <url>", "URL")
		.option("--content <content>", "Text or embed content")
		.option("--tags <tags>", "Tags (comma-separated)")
		.option("--width <n>", "Width in pixels")
		.option("--height <n>", "Height in pixels")
		.option("--usage-notes <text>", "Usage notes")
		.option("--restrictions <text>", "Usage restrictions")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				if ((o.width === undefined) !== (o.height === undefined))
					throw new Error("--width and --height must be provided together.");
				const params: CreativeCreateParams = {
					name: o.name as string | undefined,
					category: o.category,
					subcategory: o.subcategory,
					description: o.description as string | undefined,
					url: o.url as string | undefined,
					content: o.content,
					tags: commaSeparated(o.tags),
					dimensions:
						o.width !== undefined
							? { width: Number(o.width), height: Number(o.height) }
							: undefined,
					usage_notes: o.usageNotes,
					restrictions: o.restrictions,
				};
				const result = await client.program.creatives.create(params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	creatives
		.command("update <id>")
		.description("Update a creative")
		.option("--name <name>", "Creative name")
		.option("--category <category>", "Creative category")
		.option("--subcategory <subcategory>", "Creative subcategory")
		.option("--description <text>", "Description")
		.option("--url <url>", "URL")
		.option("--content <content>", "Text or embed content")
		.option("--tags <tags>", "Tags (comma-separated)")
		.option("--width <n>", "Width in pixels")
		.option("--height <n>", "Height in pixels")
		.option("--usage-notes <text>", "Usage notes")
		.option("--restrictions <text>", "Usage restrictions")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				if ((o.width === undefined) !== (o.height === undefined))
					throw new Error("--width and --height must be provided together.");
				const params: CreativeCreateParams = {};
				if (o.name !== undefined) params.name = o.name;
				if (o.category !== undefined) params.category = o.category;
				if (o.subcategory !== undefined) params.subcategory = o.subcategory;
				if (o.description !== undefined) params.description = o.description;
				if (o.url !== undefined) params.url = o.url;
				if (o.content !== undefined) params.content = o.content;
				if (o.tags !== undefined) params.tags = commaSeparated(o.tags);
				if (o.width !== undefined)
					params.dimensions = { width: Number(o.width), height: Number(o.height) };
				if (o.usageNotes !== undefined) params.usage_notes = o.usageNotes;
				if (o.restrictions !== undefined) params.restrictions = o.restrictions;
				const result = await client.program.creatives.update(id, params);
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	creatives
		.command("delete <id>")
		.description("Delete a creative")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.creatives.del(id);
				outputSuccess(result.message ?? "Creative deleted.", o);
			} catch (err) {
				handleError(err, o.json);
			}
		});
}
