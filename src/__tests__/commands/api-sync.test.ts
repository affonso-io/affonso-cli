import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	affiliateCreate: vi.fn(),
	clickCreate: vi.fn(),
	embedCreate: vi.fn(),
	paymentTermsUpdate: vi.fn(),
	trackingUpdate: vi.fn(),
	creativeCreate: vi.fn(),
	conversionCreate: vi.fn(),
	onboardingCreate: vi.fn(),
	sourceIngest: vi.fn(),
}));

vi.mock("@affonso/sdk", () => {
	class AffonsoError extends Error {}
	class MockAffonso {
		affiliates = {
			list: vi.fn(),
			retrieve: vi.fn(),
			create: mocks.affiliateCreate,
			update: vi.fn(),
			del: vi.fn(),
			retrieveOnboardingResponses: vi.fn(),
			submitOnboardingResponses: vi.fn(),
			createPortalToken: vi.fn(),
		};
		referrals = {
			list: vi.fn(),
			retrieve: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			del: vi.fn(),
		};
		clicks = { create: mocks.clickCreate };
		commissions = {
			list: vi.fn(),
			retrieve: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			del: vi.fn(),
		};
		conversions = { create: mocks.conversionCreate, refund: vi.fn() };
		events = { create: vi.fn() };
		signups = { create: vi.fn() };
		sources = { ingest: mocks.sourceIngest };
		tracking = { track: vi.fn() };
		coupons = { list: vi.fn(), retrieve: vi.fn(), create: vi.fn(), del: vi.fn() };
		payouts = { list: vi.fn(), retrieve: vi.fn(), update: vi.fn() };
		program = {
			retrieve: vi.fn(),
			update: vi.fn(),
			paymentTerms: { retrieve: vi.fn(), update: mocks.paymentTermsUpdate },
			tracking: { retrieve: vi.fn(), update: mocks.trackingUpdate },
			restrictions: { retrieve: vi.fn(), update: vi.fn() },
			groups: { list: vi.fn(), retrieve: vi.fn(), create: vi.fn(), update: vi.fn(), del: vi.fn() },
			creatives: {
				list: vi.fn(),
				retrieve: vi.fn(),
				create: mocks.creativeCreate,
				update: vi.fn(),
				del: vi.fn(),
			},
			notifications: { list: vi.fn(), update: vi.fn() },
			portal: { retrieve: vi.fn(), update: vi.fn() },
			fraudRules: { retrieve: vi.fn(), update: vi.fn() },
		};
		marketplace = { list: vi.fn(), retrieve: vi.fn() };
		embedTokens = { create: mocks.embedCreate };
		onboardingForm = {
			retrieve: vi.fn(),
			create: mocks.onboardingCreate,
			update: vi.fn(),
			del: vi.fn(),
		};
	}
	return { Affonso: MockAffonso, AffonsoError };
});

vi.mock("open", () => ({ default: vi.fn() }));

import { createProgram } from "../../cli.js";

async function run(args: string[]): Promise<void> {
	const program = createProgram();
	program.exitOverride();
	await program.parseAsync(["node", "affonso", ...args, "--json"]);
}

describe("current API contract", () => {
	const originalApiKey = process.env.AFFONSO_API_KEY;

	beforeEach(() => {
		process.env.AFFONSO_API_KEY = "sk_test_123";
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
		for (const mock of Object.values(mocks)) mock.mockResolvedValue({ id: "result_1" });
	});

	afterEach(() => {
		if (originalApiKey === undefined) Reflect.deleteProperty(process.env, "AFFONSO_API_KEY");
		else process.env.AFFONSO_API_KEY = originalApiKey;
	});

	it("creates affiliates without a program ID and parses structured fields", async () => {
		await run([
			"affiliates",
			"create",
			"--name",
			"Alice",
			"--email",
			"alice@example.com",
			"--status",
			"pending",
			"--payout-details-json",
			'{"email":"alice@example.com"}',
		]);

		const params = mocks.affiliateCreate.mock.calls[0][0];
		expect(params).toEqual(
			expect.objectContaining({
				name: "Alice",
				email: "alice@example.com",
				status: "pending",
				payout_details: { email: "alice@example.com" },
			}),
		);
		expect(params).not.toHaveProperty("program_id");
	});

	it("creates clicks with current attribution fields and no program ID", async () => {
		await run(["clicks", "create", "--tracking-id", "partner", "--gclid", "g-1"]);

		const params = mocks.clickCreate.mock.calls[0][0];
		expect(params).toEqual(expect.objectContaining({ trackingId: "partner", gclid: "g-1" }));
		expect(params).not.toHaveProperty("programId");
	});

	it("uses the nested partner contract for embed tokens", async () => {
		await run([
			"embed-tokens",
			"create",
			"--email",
			"partner@example.com",
			"--name",
			"Partner",
			"--group-id",
			"group_1",
		]);

		expect(mocks.embedCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				partner: { email: "partner@example.com", name: "Partner", image: undefined },
				groupId: "group_1",
			}),
		);
	});

	it("maps current payment and tracking settings", async () => {
		await run([
			"program",
			"payment-terms",
			"update",
			"--commission-type",
			"PERCENTAGE",
			"--commissions-hold-days",
			"14",
			"--payment-methods",
			"paypal,wise",
		]);
		expect(mocks.paymentTermsUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				commission_type: "PERCENTAGE",
				commissions_hold_days: 14,
				payment_methods: ["paypal", "wise"],
			}),
		);

		await run([
			"program",
			"tracking",
			"update",
			"--email-tracking-enabled",
			"--tracking-template-json",
			'[{"key":"ref","value":"{tracking_id}","type":"macro"}]',
		]);
		expect(mocks.trackingUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				email_tracking_enabled: true,
				tracking_template: [{ key: "ref", value: "{tracking_id}", type: "macro" }],
			}),
		);
	});

	it("maps the current creative schema", async () => {
		await run([
			"program",
			"creatives",
			"create",
			"--category",
			"banner",
			"--tags",
			"summer, sale",
			"--width",
			"1200",
			"--height",
			"630",
		]);

		expect(mocks.creativeCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				category: "banner",
				tags: ["summer", "sale"],
				dimensions: { width: 1200, height: 630 },
			}),
		);
	});

	it("exposes new conversion and onboarding resources", async () => {
		await run([
			"conversions",
			"create",
			"--sale-amount",
			"99.5",
			"--external-event-id",
			"order_1",
			"--referral-id",
			"ref_1",
		]);
		expect(mocks.conversionCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				sale_amount: 99.5,
				external_event_id: "order_1",
				referral_id: "ref_1",
			}),
		);

		await run([
			"onboarding-form",
			"create",
			"--name",
			"Application",
			"--questions-json",
			'[{"question":"Website?","type":"text_input","order":1}]',
		]);
		expect(mocks.onboardingCreate).toHaveBeenCalledWith({
			name: "Application",
			description: undefined,
			questions: [{ question: "Website?", type: "text_input", order: 1 }],
		});
	});
});
