import type { Command } from "commander";
import { getClient } from "../lib/client.js";
import { handleError } from "../lib/errors.js";
import { opts } from "../lib/opts.js";
import { output, outputSuccess } from "../output/format.js";

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
		.option("--category <cat>", "Category")
		.option("--description <text>", "Description")
		.option("--website-url <url>", "Website URL")
		.option("--logo-url <url>", "Logo URL")
		.option("--access-mode <mode>", "Access mode: PUBLIC, PRIVATE, or INVITE")
		.option("--affiliate-links-enabled", "Enable affiliate links")
		.option("--no-affiliate-links-enabled", "Disable affiliate links")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.name !== undefined) params.name = o.name;
				if (o.tagline !== undefined) params.tagline = o.tagline;
				if (o.category !== undefined) params.category = o.category;
				if (o.description !== undefined) params.description = o.description;
				if (o.websiteUrl !== undefined) params.website_url = o.websiteUrl;
				if (o.logoUrl !== undefined) params.logo_url = o.logoUrl;
				if (o.accessMode !== undefined) params.access_mode = o.accessMode;
				if (o.affiliateLinksEnabled !== undefined)
					params.affiliate_links_enabled = o.affiliateLinksEnabled;
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
		.option("--commission-type <type>", "Commission type (percentage, fixed)")
		.option("--commission-rate <n>", "Commission rate")
		.option("--commission-duration <dur>", "Duration (forever, once, first_month, custom)")
		.option("--commission-duration-value <n>", "Custom duration value")
		.option("--payment-threshold <n>", "Minimum payout threshold")
		.option("--payment-frequency <freq>", "Payment frequency (monthly, biweekly, weekly)")
		.option("--cookie-lifetime <days>", "Cookie lifetime in days")
		.option("--auto-payout", "Enable auto payout")
		.option("--no-auto-payout", "Disable auto payout")
		.option("--invoice-required", "Require invoices")
		.option("--no-invoice-required", "Don't require invoices")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.commissionType !== undefined) params.commission_type = o.commissionType;
				if (o.commissionRate !== undefined) params.commission_rate = Number(o.commissionRate);
				if (o.commissionDuration !== undefined) params.commission_duration = o.commissionDuration;
				if (o.commissionDurationValue !== undefined)
					params.commission_duration_value = Number(o.commissionDurationValue);
				if (o.paymentThreshold !== undefined) params.payment_threshold = Number(o.paymentThreshold);
				if (o.paymentFrequency !== undefined) params.payment_frequency = o.paymentFrequency;
				if (o.cookieLifetime !== undefined) params.cookie_lifetime = Number(o.cookieLifetime);
				if (o.autoPayout !== undefined) params.auto_payout = o.autoPayout;
				if (o.invoiceRequired !== undefined) params.invoice_required = o.invoiceRequired;
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
		.option("--track-email", "Track email")
		.option("--no-track-email", "Don't track email")
		.option("--track-name", "Track name")
		.option("--no-track-name", "Don't track name")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.defaultReferralParameter !== undefined)
					params.default_referral_parameter = o.defaultReferralParameter;
				if (o.enabledReferralParameters !== undefined)
					params.enabled_referral_parameters = (o.enabledReferralParameters as string).split(",");
				if (o.trackEmail !== undefined) params.track_email = o.trackEmail;
				if (o.trackName !== undefined) params.track_name = o.trackName;
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
		.option("--paid-ads", "Allow paid ads")
		.option("--no-paid-ads", "Disallow paid ads")
		.option("--content-marketing", "Allow content marketing")
		.option("--no-content-marketing", "Disallow content marketing")
		.option("--coupon-sites", "Allow coupon sites")
		.option("--no-coupon-sites", "Disallow coupon sites")
		.option("--review-sites", "Allow review sites")
		.option("--no-review-sites", "Disallow review sites")
		.option("--incentivized-traffic", "Allow incentivized traffic")
		.option("--no-incentivized-traffic", "Disallow incentivized traffic")
		.option("--trademark-bidding", "Allow trademark bidding")
		.option("--no-trademark-bidding", "Disallow trademark bidding")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				const fieldMap: [string, string][] = [
					["websites", "websites"],
					["socialMarketing", "social_marketing"],
					["organicSocial", "organic_social"],
					["emailMarketing", "email_marketing"],
					["paidAds", "paid_ads"],
					["contentMarketing", "content_marketing"],
					["couponSites", "coupon_sites"],
					["reviewSites", "review_sites"],
					["incentivizedTraffic", "incentivized_traffic"],
					["trademarkBidding", "trademark_bidding"],
				];
				for (const [camel, snake] of fieldMap) {
					const val = o[camel];
					if (val !== undefined) params[snake] = val;
				}
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
		.option("--self-referral <mode>", "Self-referral mode (off, detect, block)")
		.option("--duplicate-ip <mode>", "Duplicate IP mode (off, detect, block)")
		.option("--vpn-proxy <mode>", "VPN/Proxy mode (off, detect, block)")
		.option("--suspicious-conversion <mode>", "Suspicious conversion mode (off, detect, block)")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.selfReferral !== undefined) params.self_referral = o.selfReferral;
				if (o.duplicateIp !== undefined) params.duplicate_ip = o.duplicateIp;
				if (o.vpnProxy !== undefined) params.vpn_proxy = o.vpnProxy;
				if (o.suspiciousConversion !== undefined)
					params.suspicious_conversion = o.suspiciousConversion;
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
		.option("--primary-color <color>", "Primary color (hex)")
		.option("--accent-color <color>", "Accent color (hex)")
		.option("--logo-url <url>", "Logo URL")
		.option("--favicon-url <url>", "Favicon URL")
		.option("--custom-domain <domain>", "Custom domain")
		.option("--terms-url <url>", "Terms URL")
		.option("--privacy-url <url>", "Privacy URL")
		.option("--onboarding-enabled", "Enable onboarding")
		.option("--no-onboarding-enabled", "Disable onboarding")
		.option("--resources-enabled", "Enable resources")
		.option("--no-resources-enabled", "Disable resources")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.primaryColor !== undefined) params.primary_color = o.primaryColor;
				if (o.accentColor !== undefined) params.accent_color = o.accentColor;
				if (o.logoUrl !== undefined) params.logo_url = o.logoUrl;
				if (o.faviconUrl !== undefined) params.favicon_url = o.faviconUrl;
				if (o.customDomain !== undefined) params.custom_domain = o.customDomain;
				if (o.termsUrl !== undefined) params.terms_url = o.termsUrl;
				if (o.privacyUrl !== undefined) params.privacy_url = o.privacyUrl;
				if (o.onboardingEnabled !== undefined) params.onboarding_enabled = o.onboardingEnabled;
				if (o.resourcesEnabled !== undefined) params.resources_enabled = o.resourcesEnabled;
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
				output(result, o, ["id", "email_type", "subject", "enabled", "recipient"]);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	notifications
		.command("update <id>")
		.description("Update a notification setting")
		.option("--subject <text>", "Email subject")
		.option("--enabled", "Enable notification")
		.option("--no-enabled", "Disable notification")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.subject !== undefined) params.subject = o.subject;
				if (o.enabled !== undefined) params.enabled = o.enabled;
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
					"is_default",
					"affiliate_count",
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
		.option("--is-default", "Set as default group")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.groups.create({
					name: o.name as string,
					description: o.description as string | undefined,
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
		.option("--is-default", "Set as default group")
		.option("--no-is-default", "Unset as default group")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.name !== undefined) params.name = o.name;
				if (o.description !== undefined) params.description = o.description;
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
		.option("--type <type>", "Filter by type")
		.option("--search <query>", "Search by name")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.creatives.list({
					limit: Number(o.limit),
					page: Number(o.page),
					type: o.type as string | undefined,
					search: o.search as string | undefined,
				});
				output(result, o, ["id", "name", "type", "url", "created_at"]);
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
		.requiredOption("--name <name>", "Creative name")
		.requiredOption("--type <type>", "Creative type")
		.option("--description <text>", "Description")
		.option("--url <url>", "URL")
		.option("--file-url <url>", "File URL")
		.option("--width <n>", "Width in pixels")
		.option("--height <n>", "Height in pixels")
		.action(async function (this: Command) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const result = await client.program.creatives.create({
					name: o.name as string,
					type: o.type as string,
					description: o.description as string | undefined,
					url: o.url as string | undefined,
					file_url: o.fileUrl as string | undefined,
					width: o.width ? Number(o.width) : undefined,
					height: o.height ? Number(o.height) : undefined,
				});
				output(result, o);
			} catch (err) {
				handleError(err, o.json);
			}
		});

	creatives
		.command("update <id>")
		.description("Update a creative")
		.option("--name <name>", "Creative name")
		.option("--type <type>", "Creative type")
		.option("--description <text>", "Description")
		.option("--url <url>", "URL")
		.option("--file-url <url>", "File URL")
		.option("--width <n>", "Width in pixels")
		.option("--height <n>", "Height in pixels")
		.action(async function (this: Command, id: string) {
			const o = opts(this);
			try {
				const client = await getClient(o);
				const params: Record<string, unknown> = {};
				if (o.name !== undefined) params.name = o.name;
				if (o.type !== undefined) params.type = o.type;
				if (o.description !== undefined) params.description = o.description;
				if (o.url !== undefined) params.url = o.url;
				if (o.fileUrl !== undefined) params.file_url = o.fileUrl;
				if (o.width !== undefined) params.width = Number(o.width);
				if (o.height !== undefined) params.height = Number(o.height);
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
