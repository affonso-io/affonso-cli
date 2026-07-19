import { describe, expect, it } from "vitest";
import { formatJson } from "../output/json.js";
import { formatSingle, formatTable } from "../output/table.js";

describe("output/table", () => {
	it("returns message for empty data", () => {
		expect(formatTable([])).toBe("No results found.");
	});

	it("formats rows with headers", () => {
		const data = [
			{ id: "aff_1", name: "Alice", status: "approved" },
			{ id: "aff_2", name: "Bob", status: "pending" },
		];
		const result = formatTable(data);
		// Should contain header and both rows
		expect(result).toContain("ID");
		expect(result).toContain("NAME");
		expect(result).toContain("STATUS");
		expect(result).toContain("aff_1");
		expect(result).toContain("Alice");
		expect(result).toContain("aff_2");
		expect(result).toContain("Bob");
	});

	it("matches the separator width to the visible table width", () => {
		const result = formatTable([{ short: "x", longer: "y" }]);
		const separator = result.split("\n")[1];

		expect([...separator].filter((character) => character === "─")).toHaveLength(13);
	});

	it("respects column selection", () => {
		const data = [{ id: "1", name: "Test", email: "test@test.com" }];
		const result = formatTable(data, ["id", "name"]);
		expect(result).toContain("ID");
		expect(result).toContain("NAME");
		expect(result).not.toContain("EMAIL");
	});

	it("formats null values as dash", () => {
		const data = [{ id: "1", name: null }];
		const result = formatTable(data);
		// The dash character used for null
		expect(result).toContain("—");
	});

	it("formats boolean values", () => {
		const data = [{ active: true, deleted: false }];
		const result = formatTable(data);
		expect(result).toContain("yes");
		expect(result).toContain("no");
	});

	it("truncates ISO dates", () => {
		const data = [{ created_at: "2025-03-15T10:00:00Z" }];
		const result = formatTable(data);
		expect(result).toContain("2025-03-15");
		expect(result).not.toContain("10:00:00");
	});
});

describe("output/table formatSingle", () => {
	it("formats key-value pairs", () => {
		const data = { id: "aff_1", name: "Alice", status: "approved" };
		const result = formatSingle(data);
		expect(result).toContain("id");
		expect(result).toContain("aff_1");
		expect(result).toContain("name");
		expect(result).toContain("Alice");
	});
});

describe("output/json", () => {
	it("formats as pretty JSON", () => {
		const data = { id: "1", name: "Test" };
		const result = formatJson(data);
		expect(JSON.parse(result)).toEqual(data);
		expect(result).toContain("\n"); // Pretty printed
	});

	it("handles arrays", () => {
		const data = [{ id: "1" }, { id: "2" }];
		const result = formatJson(data);
		expect(JSON.parse(result)).toEqual(data);
	});
});
