import { describe, expect, it } from "vitest";
import packageJson from "../../package.json";
import { createProgram } from "../cli.js";

describe("CLI metadata", () => {
	it("reports the package version", () => {
		expect(createProgram().version()).toBe(packageJson.version);
	});
});
