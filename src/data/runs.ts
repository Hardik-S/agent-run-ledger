export const fixtureJsonl = [
  {
    id: "run-001",
    timestamp: "2026-05-10 20:19 America/Toronto",
    project: "Reviewer Evidence Console",
    repo: "Hardik-S/reviewer-evidence-console",
    status: "shipped",
    outcome:
      "Built a public proof-packet console, verified tests and build, and deployed the Vercel production alias.",
    blockerState: null,
    retries: 1,
    tokenBurn: 18420,
    nextAction: "Select Agent Run Ledger from the queue.",
  },
  {
    id: "run-002",
    timestamp: "2026-05-10 20:32 America/Toronto",
    project: "Agent Run Ledger",
    repo: "Hardik-S/agent-run-ledger",
    status: "blocked-cleanly",
    outcome:
      "Package scaffold rejected an uppercase worktree folder name; switched to manual scaffold with lowercase package metadata.",
    blockerState: "no-remote",
    retries: 1,
    tokenBurn: 9200,
    nextAction: "Keep worktree path stable and verify parser tests.",
  },
  {
    id: "run-003",
    timestamp: "2026-05-10 20:47 America/Toronto",
    project: "Coordination Repo",
    repo: "Hardik-S/portfolio-product-automation",
    status: "shipped",
    outcome:
      "Updated queue and run log after a worker completed one coherent project increment.",
    blockerState: null,
    retries: 0,
    tokenBurn: 6100,
    nextAction: "Resume with the highest-priority queued product.",
  },
] as const;
