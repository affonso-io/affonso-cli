# CLI Baseline Audit

Date: 2026-07-17
Target: `origin/main`

## Findings

- The CLI package version is `0.1.3`, but the built command previously reported a hard-coded `0.1.0`.
- The package lock pointed the binary at `dist/cli.js` while `package.json` and the build produce `dist/index.js`.
- `@affonso/sdk` was pinned to `^0.1.0`; the current workspace update uses `^0.2.0`.
- The published SDK `0.2.0` manifest references `dist/index.cjs` and `dist/index.d.cts`, but those files are absent. The CLI therefore bundles the SDK temporarily so its CommonJS executable remains runnable.
- Biome reported existing import-order, formatting, environment-cleanup, and ANSI-width diagnostics across the source and tests.

## Baseline Resolution

- The CLI reads its version from `package.json`.
- The package lock binary path matches `dist/index.js`.
- Source and tests pass the configured Biome checks without disabling rules.
- The build bundles `@affonso/sdk` until a corrected SDK release is available and verified.
- `npm run test:package` builds the release tarball, installs it in a clean temporary project, and checks both `affonso --help` and `affonso --version`.
- CI runs all quality gates on Node.js 22 and the package smoke test under Node.js 18, 20, and 22.

## Remaining Dependencies

Customer API synchronization must follow the PRD order: API/OpenAPI, SDK, corrected SDK release, then CLI. New CLI resource commands and contract changes remain blocked until the matching SDK operations are implemented and published; the CLI must not add raw HTTP workarounds.

## 2026-09-22 Follow-up

- `@affonso/sdk@1.0.2` now ships valid CommonJS, ESM, and declaration entry points, so the CLI no longer bundles the SDK as a packaging workaround.
- The CLI is synchronized with API commit `4dee5f8` for all existing commands and all resources exposed by SDK 1.0.2.
- The latest SDK now exposes onboarding forms and responses, affiliate portal tokens, signups, conversions and refunds, events, source adapters, and public tracking; matching CLI commands were added.
- SDK 1.0.2 still does not expose the Customer API's affiliate analytics, Finder, program brand profile, or promotion URL resources. Those remain blocked at the SDK layer; no raw-HTTP CLI workaround was introduced.
