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

```powershell
npm install
npm run test
npm run build
npm run dev
```

## Fixture Provenance

All current records in `src/data/runs.ts` are synthetic or heavily generalized from coordination-run patterns. Real local JSONL logs are intentionally excluded from this public repository. If the product later reads real session files, that importer should live behind a redaction step and be documented as a private/local-only path.

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
- Included one blocked-cleanly sample to make failure handling a first-class product state, not an exception hidden from the reviewer.

## Verification

- `npm run test`
- `npm run build`

## Deployment

Expected deployment target: Vercel production project `agent-run-ledger`.
