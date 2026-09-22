# @affonso/cli

Command-line interface for the [Affonso](https://affonso.io) affiliate marketing platform. Manage affiliates, referrals, commissions, payouts, and program settings — from your terminal or through AI agents.

## Why a CLI?

The Affonso CLI is designed for two audiences:

- **Developers** who want to manage their affiliate program without leaving the terminal
- **AI agents** (OpenClaw, Paperclip, Claude, GPT, custom agents) that can use shell tools to build automated affiliate workflows — approving affiliates, tracking commissions, managing payouts, and more

Every command supports `--json` output, making it straightforward for agents to parse responses and chain commands together.

## Installation

```bash
npm install -g @affonso/cli
```

Or run directly with npx:

```bash
npx @affonso/cli <command>
```

## Authentication

### OAuth (recommended)

```bash
affonso login
```

Opens your browser for secure authentication via OAuth 2.1 with PKCE. Tokens are stored locally in `~/.config/affonso/auth.json`.

```bash
affonso logout    # revoke token and clear credentials
affonso whoami    # show current auth status
```

### API key

Pass it per-command, set it in your environment, or store it in the CLI config:

```bash
# Per-command
affonso affiliates list --api-key sk_live_...

# Environment variable
export AFFONSO_API_KEY=sk_live_...

# Store in config
affonso config set api-key sk_live_...
```

Auth priority: `--api-key` flag > `AFFONSO_API_KEY` env var > stored config > OAuth token.

## Usage

```bash
affonso <command> <subcommand> [options]
```

### Global options

| Option | Description |
|---|---|
| `--json` | Output as JSON |
| `--api-key <key>` | API key for this request |
| `--base-url <url>` | Custom API base URL |
| `--no-color` | Disable colored output |
| `--version` | Show version |
| `--help` | Show help |

### Commands

#### Affiliates

```bash
affonso affiliates list [--status pending|approved|rejected] [--search <query>] [--limit <n>] [--page <n>]
affonso affiliates get <id>
affonso affiliates create --name <name> --email <email> [--status pending|approved|rejected] [--metadata-json <json|@file>]
affonso affiliates update <id> [--name <name>] [--status <status>] [--invoice-details-json <json|@file>]
affonso affiliates onboarding-responses get <id>
affonso affiliates onboarding-responses submit <id> --responses-json <json|@file> [--mark-complete]
affonso affiliates portal-token <id>
affonso affiliates delete <id>
```

#### Referrals

```bash
affonso referrals list [--affiliate-id <id>] [--external-user-id <id>] [--status <status>] [--limit <n>]
affonso referrals get <id>
affonso referrals create --email <email> --affiliate-id <id> [--metadata-json <json|@file>]
affonso referrals update <id> [--status <status>] [--email <email>] [--metadata-json <json|@file>]
affonso referrals delete <id>
```

#### Commissions

```bash
affonso commissions list [--status <status>] [--affiliate-id <id>] [--limit <n>] [--page <n>]
affonso commissions get <id>
affonso commissions create --referral-id <id> --sale-amount <n> --commission-amount <n> [--sale-amount-currency <code>] [--commission-currency <code>]
affonso commissions update <id> [--status <status>] [--sale-amount <n>]
affonso commissions delete <id>
```

#### Coupons

```bash
affonso coupons list [--affiliate-id <id>] [--search <query>]
affonso coupons get <id>
affonso coupons create --affiliate-id <id> --code <code> --discount-type <type> --discount-value <n> --duration <dur>
affonso coupons delete <id>
```

#### Payouts

```bash
affonso payouts list [--status <status>] [--affiliate-id <id>]
affonso payouts get <id>
affonso payouts update <id> --status <status>
```

#### Clicks

```bash
affonso clicks create --tracking-id <id> [--created-at <date>] [--gclid <id>] [--fbclid <id>]
```

#### Embed tokens

```bash
affonso embed-tokens create --email <email> [--name <name>] [--group-id <id>] [--external-user-id <id>]
```

#### Onboarding forms

```bash
affonso onboarding-form get
affonso onboarding-form create --name <name> --questions-json <json|@file>
affonso onboarding-form update [--name <name>] [--questions-json <json|@file>]
affonso onboarding-form delete
```

#### Server-side events

Conversions and generic events are signed with `AFFONSO_SIGNING_SECRET`. Source adapters use
`AFFONSO_CUSTOM_SOURCE_SIGNING_SECRET` or `AFFONSO_SEGMENT_SIGNING_SECRET`.

```bash
affonso signups create --click-id <id> [--email <email>] [--external-user-id <id>]
affonso conversions create --sale-amount <n> --external-event-id <id> [--referral-id <id>]
affonso conversions refund <id> [--amount <n>] [--reason <text>]
affonso events create --event-name <name> [--event-type conversion|lead|trial|milestone]
affonso sources ingest custom --payload-json <json|@file>
```

#### Public tracking

```bash
affonso tracking track --program-id <id> [--tracking-id <id>] [--utm-source <value>]
```

#### Program settings

```bash
affonso program get
affonso program update [--name <name>] [--access-mode PUBLIC|PRIVATE|INVITE]

# Sub-resources
affonso program payment-terms get|update
affonso program tracking get|update
affonso program restrictions get|update
affonso program fraud-rules get|update
affonso program portal get|update
affonso program notifications list|update <id>
affonso program groups list|get <id>|create|update <id>|delete <id>
affonso program creatives list|get <id>|create|update <id>|delete <id>
```

#### Marketplace (public, no auth required)

```bash
affonso marketplace list [--category <cat>]
affonso marketplace get <id>
```

#### Config

```bash
affonso config get <key>     # api-key, base-url
affonso config set <key> <value>
```

## JSON output

Add `--json` to any command for machine-readable output:

```bash
affonso affiliates list --json
affonso affiliates get aff_123 --json
```

This is especially useful for AI agents that need to parse and act on the data programmatically.
Options ending in `--*-json` accept either inline JSON or `@path/to/file.json`. Invalid JSON is
rejected before an API request is made.

## Use with AI agents

The CLI works as a tool for any AI agent that can execute shell commands. Set `AFFONSO_API_KEY` in the agent's environment and use `--json` for structured output:

```bash
# An agent can list pending affiliates and approve them
affonso affiliates list --status pending --json
affonso affiliates update aff_123 --status approved --json

# Track and manage commissions
affonso commissions list --affiliate-id aff_123 --json
affonso payouts list --status pending --json
```

## License

MIT
