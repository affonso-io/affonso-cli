import { Command } from "commander";
import packageJson from "../package.json";
import { registerAffiliateCommands } from "./commands/affiliates.js";
import { registerClickCommands } from "./commands/clicks.js";
import { registerCommissionCommands } from "./commands/commissions.js";
import { registerConfigCommands } from "./commands/config.js";
import { registerCouponCommands } from "./commands/coupons.js";
import { registerEmbedTokenCommands } from "./commands/embed-tokens.js";
import { registerLoginCommand } from "./commands/login.js";
import { registerLogoutCommand } from "./commands/logout.js";
import { registerMarketplaceCommands } from "./commands/marketplace.js";
import { registerPayoutCommands } from "./commands/payouts.js";
import { registerProgramCommands } from "./commands/program.js";
import { registerReferralCommands } from "./commands/referrals.js";
import { registerWhoamiCommand } from "./commands/whoami.js";

export function createProgram(): Command {
	const program = new Command();

	program
		.name("affonso")
		.description("Affonso CLI — manage your affiliate program from the terminal")
		.version(packageJson.version)
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key for this request")
		.option("--base-url <url>", "Custom API base URL")
		.option("--no-color", "Disable colored output");

	// Auth commands
	registerLoginCommand(program);
	registerLogoutCommand(program);
	registerWhoamiCommand(program);
	registerConfigCommands(program);

	// Resource commands
	registerAffiliateCommands(program);
	registerReferralCommands(program);
	registerClickCommands(program);
	registerCommissionCommands(program);
	registerCouponCommands(program);
	registerPayoutCommands(program);
	registerProgramCommands(program);
	registerMarketplaceCommands(program);
	registerEmbedTokenCommands(program);

	return program;
}
