import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Test the CLI commands by setting env and mocking the SDK at the package level
const { mockList, mockRetrieve, mockCreate, mockUpdate, mockDel } = vi.hoisted(() => {
	const mockList = vi.fn();
	const mockRetrieve = vi.fn();
	const mockCreate = vi.fn();
	const mockUpdate = vi.fn();
	const mockDel = vi.fn();
	return { mockList, mockRetrieve, mockCreate, mockUpdate, mockDel };
});

vi.mock("@affonso/sdk", () => {
	class AffonsoError extends Error {
		status?: number;
		code?: string;
	}
	class MockAffonso {
		affiliates = {
			list: mockList,
			retrieve: mockRetrieve,
			create: mockCreate,
			update: mockUpdate,
			del: mockDel,
		};
		referrals = {
			list: vi.fn(),
			retrieve: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			del: vi.fn(),
		};
		clicks = { create: vi.fn() };
		commissions = {
			list: vi.fn(),
			retrieve: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			del: vi.fn(),
		};
		coupons = { list: vi.fn(), retrieve: vi.fn(), create: vi.fn(), del: vi.fn() };
		payouts = { list: vi.fn(), retrieve: vi.fn(), update: vi.fn() };
		program = {
			retrieve: vi.fn(),
			update: vi.fn(),
			paymentTerms: { retrieve: vi.fn(), update: vi.fn() },
			tracking: { retrieve: vi.fn(), update: vi.fn() },
			restrictions: { retrieve: vi.fn(), update: vi.fn() },
			groups: { list: vi.fn(), retrieve: vi.fn(), create: vi.fn(), update: vi.fn(), del: vi.fn() },
			creatives: {
				list: vi.fn(),
				retrieve: vi.fn(),
				create: vi.fn(),
				update: vi.fn(),
				del: vi.fn(),
			},
			notifications: { list: vi.fn(), update: vi.fn() },
			portal: { retrieve: vi.fn(), update: vi.fn() },
			fraudRules: { retrieve: vi.fn(), update: vi.fn() },
		};
		marketplace = { list: vi.fn(), retrieve: vi.fn() };
		embedTokens = { create: vi.fn() };
	}
	return { Affonso: MockAffonso, AffonsoError };
});

// Mock the `open` package to avoid opening browsers
vi.mock("open", () => ({ default: vi.fn() }));

import { createProgram } from "../../cli.js";

describe("affiliates commands", () => {
	const originalApiKey = process.env.AFFONSO_API_KEY;
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		process.env.AFFONSO_API_KEY = "sk_test_123";
		consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});

		mockList.mockResolvedValue({
			data: [
				{
					id: "aff_1",
					name: "Alice",
					email: "alice@test.com",
					partnership_status: "approved",
					tracking_id: "track_1",
					created_at: "2025-01-01T00:00:00Z",
				},
			],
			pagination: { page: 1, total_pages: 1, total: 1 },
		});
		mockRetrieve.mockResolvedValue({
			id: "aff_1",
			name: "Alice",
			email: "alice@test.com",
			partnership_status: "approved",
		});
		mockCreate.mockResolvedValue({
			id: "aff_new",
			name: "Bob",
			email: "bob@test.com",
		});
		mockUpdate.mockResolvedValue({ id: "aff_1", name: "Updated" });
		mockDel.mockResolvedValue({ success: true, message: "Deleted" });
	});

	afterEach(() => {
		if (originalApiKey === undefined) {
			Reflect.deleteProperty(process.env, "AFFONSO_API_KEY");
		} else {
			process.env.AFFONSO_API_KEY = originalApiKey;
		}
	});

	it("affiliates list outputs JSON", async () => {
		const program = createProgram();
		program.exitOverride();

		await program.parseAsync(["node", "affonso", "affiliates", "list", "--json"]);
		expect(consoleSpy).toHaveBeenCalled();

		const out = consoleSpy.mock.calls[0][0];
		const parsed = JSON.parse(out);
		expect(parsed.data).toHaveLength(1);
		expect(parsed.data[0].id).toBe("aff_1");
	});

	it("affiliates get outputs single item", async () => {
		const program = createProgram();
		program.exitOverride();

		await program.parseAsync(["node", "affonso", "affiliates", "get", "aff_1", "--json"]);
		expect(consoleSpy).toHaveBeenCalled();

		const out = consoleSpy.mock.calls[0][0];
		const parsed = JSON.parse(out);
		expect(parsed.id).toBe("aff_1");
	});

	it("affiliates create sends correct params", async () => {
		const program = createProgram();
		program.exitOverride();

		await program.parseAsync([
			"node",
			"affonso",
			"affiliates",
			"create",
			"--name",
			"Bob",
			"--email",
			"bob@test.com",
			"--program-id",
			"prog_1",
			"--json",
		]);

		expect(mockCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "Bob",
				email: "bob@test.com",
				program_id: "prog_1",
			}),
		);
	});

	it("affiliates list calls SDK with filters", async () => {
		const program = createProgram();
		program.exitOverride();

		await program.parseAsync([
			"node",
			"affonso",
			"affiliates",
			"list",
			"--status",
			"approved",
			"--limit",
			"10",
			"--json",
		]);

		expect(mockList).toHaveBeenCalledWith(
			expect.objectContaining({
				partnership_status: "approved",
				limit: 10,
			}),
		);
	});

	it("affiliates delete calls SDK", async () => {
		const program = createProgram();
		program.exitOverride();

		await program.parseAsync(["node", "affonso", "affiliates", "delete", "aff_1", "--json"]);
		expect(mockDel).toHaveBeenCalledWith("aff_1");
	});
});
