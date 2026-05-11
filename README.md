# Agent Run Ledger

Agent Run Ledger is a public, synthetic-fixture dashboard for making agent-heavy work auditable. It shows shipped output, clean blockers, retry pressure, token burn, and the next safe action from JSONL-style run records.

## Portfolio Signal

This project demonstrates operational judgment around AI-agent execution. The product does not claim that agents are magic; it makes their outcomes reviewable through explicit evidence, canonical blocker states, retry counts, and continuation notes.

## Stack Rationale

- Next.js App Router keeps the first slice deployable on Vercel while leaving room for future server routes.
- TypeScript makes the run-record contract explicit.
- Fixture-first data keeps the repository public and avoids leaking real local session logs.
- Vitest covers the parser and summary logic because those rules are the behavioral core of the product.

## Local Setup

Use Node 20 or newer. Prefer `npm ci` for reviewer or CI runs because this repository includes a lockfile.

```powershell
npm ci
npm run test
npm run typecheck
npm run build
npm run dev
```

If `npm run test` fails with `vitest` not found, dependencies are not installed in the current worktree. Run `npm ci` again and confirm `node_modules/.bin/vitest` exists before debugging test code.

## Fixture Provenance

All current records in `src/data/runs.ts` are synthetic or heavily generalized from coordination-run patterns. No raw run logs, local JSONL transcripts, private prompts, credentials, or personal session files are committed to this public repository. The repo keeps the data public by using invented run IDs plus generalized evidence such as commit states, verification commands, blocker classes, and safe handoff notes.

If the product later reads real session files, that importer should live behind a redaction step and be documented as a private/local-only path.

## Fixture Contract

Each run record has a closed contract so reviewer packets are predictable:

- `id`: stable synthetic row key.
- `timestamp`: human-readable timestamp with timezone.
- `project`: portfolio product or coordination surface being summarized.
- `repo`: `owner/name` source of truth; current public fixtures use only `Hardik-S` repositories.
- `status`: one of `shipped`, `blocked-cleanly`, or `in-progress`.
- `outcome`: short result narrative for the run.
- `blockerState`: one canonical blocker state for `blocked-cleanly`; `null` for `shipped` and `in-progress`.
- `retries`: retry count for the main failed or completed surface.
- `attemptsUsed`: total attempts consumed before stopping or shipping.
- `tokenBurn`: synthetic token-count estimate for comparing run weight, not billing evidence.
- `evidence`: reviewer-facing claims that explain why the row should be trusted.
- `verification`: commands or checks tied to the run.
- `handoff`: safe continuation note for the next worker or reviewer.
- `nextAction`: the next concrete action.

Parser validation rejects invalid status values, inherited blocker keys such as `toString`, missing required fields, `shipped` runs with blockers, `blocked-cleanly` runs without blockers, and `in-progress` rows that pretend to be final blocker reports.

## Blocker-State Taxonomy

The dashboard uses the canonical states from the coordination workflow:

- `auth-ok`
- `auth-invalid`
- `config-inaccessible`
- `transport-blocked`
- `no-remote`
- `acl-denied`
- `dirty-worktree`
- `dirty-worktree-entangled`

Keeping the vocabulary closed prevents vague failure notes like "GitHub broken" and makes retry discipline visible.

## Decisions

- Built the first slice as a deterministic dashboard rather than adding file upload. This proves the core observability model with less privacy risk.
- Kept records in TypeScript fixtures instead of bundling raw JSONL files. This lets the UI ship immediately while the tested parser still accepts newline-delimited JSON.
- Added reviewer-packet fields instead of charts first because the portfolio signal is auditability, not visualization density.
- Included shipped, blocked-cleanly, and in-progress samples to make handoff state visible in the product instead of only in this README.

## Reviewer Evidence

- `1412c3a`: initialized the public repository.
- `d561a29`: built the first public dashboard slice.
- `0c254f4`: documented the production deploy.
- Current fixer branch: adds schema validation, richer synthetic evidence records, reviewer packets, a typecheck script, and README deploy/fixture contract updates.
- Current verification target: `npm run test`, `npm run typecheck`, `npm run build`, and a live HTTP smoke check.

## Verification

- `npm run test`
- `npm run typecheck`
- `npm run build`

## Deployment

Vercel production URL: https://agent-run-ledger.vercel.app

Deployment project: `agent-run-ledger` under the authenticated Vercel scope. The project root is the repository root, the build command is `npm run build`, and no environment variables are required for the current static fixture dashboard. Local `.vercel/` bindings stay ignored because they are machine/account-specific; a future `vercel.json` can be committed if project defaults need to be pinned.

The first production deployment used `npx vercel@latest --prod --yes --name agent-run-ledger` because the global Vercel CLI was not installed. To redeploy:

```powershell
npm ci
npm run test
npm run typecheck
npm run build
npx vercel@latest --prod --yes --name agent-run-ledger
curl.exe -L --max-time 20 https://agent-run-ledger.vercel.app
```

The live smoke check should return `200` and include `Agent Run Ledger` plus reviewer-packet copy such as `What this proves`.

## Limitations And Next Actions

- Current data is synthetic only; there is no redacted importer for real local sessions.
- The dashboard has no persistence, auth, or live token-source integration.
- Token burn is fixture metadata, not an account-level usage meter.
- Accessibility and mobile behavior rely on semantic markup and responsive CSS; no automated axe or Lighthouse gate is committed yet.
- Next improvements should be a redacted JSONL importer, CI verification workflow, optional committed Vercel config, accessibility smoke tests, and reviewer-packet export.
