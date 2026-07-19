import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock fs to avoid touching real filesystem
vi.mock("node:fs");
vi.mock("node:os", () => ({
	default: { homedir: () => "/tmp/test-home" },
	homedir: () => "/tmp/test-home",
}));

describe("auth/storage", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.mocked(fs.existsSync).mockReturnValue(false);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("loadAuth returns null when no file exists", async () => {
		const { loadAuth } = await import("../auth/storage.js");
		expect(loadAuth()).toBeNull();
	});

	it("loadAuth returns parsed auth when file exists", async () => {
		const mockAuth = {
			access_token: "tok_123",
			refresh_token: "ref_456",
			expires_at: Date.now() + 3600000,
		};
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockAuth));

		const { loadAuth } = await import("../auth/storage.js");
		const result = loadAuth();
		expect(result).toEqual(mockAuth);
	});

	it("loadAuth returns null on parse error", async () => {
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.readFileSync).mockReturnValue("not json");

		const { loadAuth } = await import("../auth/storage.js");
		expect(loadAuth()).toBeNull();
	});

	it("saveAuth writes file with restricted permissions", async () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
		vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

		const { saveAuth } = await import("../auth/storage.js");
		saveAuth({
			access_token: "tok",
			refresh_token: "ref",
			expires_at: 123,
		});

		expect(fs.writeFileSync).toHaveBeenCalledWith(
			expect.stringContaining("auth.json"),
			expect.any(String),
			{ mode: 0o600 },
		);
	});

	it("clearAuth removes file if exists", async () => {
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.unlinkSync).mockReturnValue(undefined);

		const { clearAuth } = await import("../auth/storage.js");
		clearAuth();

		expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining("auth.json"));
	});

	it("loadConfig returns empty object when no file exists", async () => {
		const { loadConfig } = await import("../auth/storage.js");
		expect(loadConfig()).toEqual({});
	});
});

describe("auth/resolve", () => {
	const originalApiKey = process.env.AFFONSO_API_KEY;

	beforeEach(() => {
		vi.resetModules();
		Reflect.deleteProperty(process.env, "AFFONSO_API_KEY");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (originalApiKey === undefined) {
			Reflect.deleteProperty(process.env, "AFFONSO_API_KEY");
		} else {
			process.env.AFFONSO_API_KEY = originalApiKey;
		}
	});

	it("resolves from flag first", async () => {
		const { resolveAuth } = await import("../auth/resolve.js");
		const result = resolveAuth("sk_test_flag");
		expect(result).toEqual({ apiKey: "sk_test_flag", source: "flag" });
	});

	it("resolves from env var second", async () => {
		process.env.AFFONSO_API_KEY = "sk_test_env";
		const { resolveAuth } = await import("../auth/resolve.js");
		const result = resolveAuth();
		expect(result).toEqual({ apiKey: "sk_test_env", source: "env" });
	});

	it("returns null when no auth available", async () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		const { resolveAuth } = await import("../auth/resolve.js");
		const result = resolveAuth();
		expect(result).toBeNull();
	});

	it("resolveBaseUrl returns default when no override", async () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		const { resolveBaseUrl } = await import("../auth/resolve.js");
		expect(resolveBaseUrl()).toBe("https://api.affonso.io/v1");
	});

	it("resolveBaseUrl prefers flag over config", async () => {
		const { resolveBaseUrl } = await import("../auth/resolve.js");
		expect(resolveBaseUrl("https://custom.api")).toBe("https://custom.api");
	});
});
