import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const packDirectory = mkdtempSync(path.join(tmpdir(), "affonso-cli-pack-"));
const installDirectory = mkdtempSync(path.join(tmpdir(), "affonso-cli-install-"));

function run(command, args, cwd = root) {
	return execFileSync(command, args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "inherit"],
	}).trim();
}

try {
	const packResult = JSON.parse(
		run("npm", ["pack", "--json", "--silent", "--pack-destination", packDirectory]),
	);
	const tarball = path.join(packDirectory, packResult[0].filename);

	writeFileSync(
		path.join(installDirectory, "package.json"),
		JSON.stringify({ name: "affonso-cli-smoke", private: true }),
	);
	run(
		"npm",
		["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
		installDirectory,
	);

	const executable = path.join(
		installDirectory,
		"node_modules",
		".bin",
		process.platform === "win32" ? "affonso.cmd" : "affonso",
	);
	const version = run(executable, ["--version"], installDirectory);
	const help = run(executable, ["--help"], installDirectory);

	if (version !== packageJson.version) {
		throw new Error(`Expected CLI version ${packageJson.version}, received ${version}`);
	}
	if (!help.includes("Usage: affonso") || !help.includes("Commands:")) {
		throw new Error("Packed CLI help output is incomplete");
	}

	console.log(`Packed CLI ${version} passed install, version, and help smoke tests.`);
} finally {
	rmSync(packDirectory, { recursive: true, force: true });
	rmSync(installDirectory, { recursive: true, force: true });
}
