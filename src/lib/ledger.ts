export const blockerLabels = {
  "auth-ok": "Auth OK",
  "auth-invalid": "Invalid auth",
  "config-inaccessible": "Config inaccessible",
  "transport-blocked": "Transport blocked",
  "no-remote": "No remote",
  "acl-denied": "ACL denied",
  "dirty-worktree": "Dirty worktree",
  "dirty-worktree-entangled": "Dirty worktree entangled",
} as const;

export type BlockerState = keyof typeof blockerLabels;

export type RawRun = {
  id: string;
  timestamp: string;
  project: string;
  repo: string;
  status: "shipped" | "blocked-cleanly" | "in-progress";
  outcome: string;
  blockerState: BlockerState | null;
  retries: number;
  tokenBurn: number;
  nextAction: string;
};

export function parseRuns(input: string | readonly RawRun[]): RawRun[] {
  if (typeof input !== "string") {
    return [...input];
  }

  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as RawRun);
}

export function buildLedger(input: string | readonly RawRun[]) {
  const runs = parseRuns(input);
  const blockers = new Map<BlockerState, number>();

  for (const run of runs) {
    if (run.blockerState) {
      blockers.set(run.blockerState, (blockers.get(run.blockerState) ?? 0) + 1);
    }
  }

  return {
    runs,
    summary: {
      totalRuns: runs.length,
      shippedRuns: runs.filter((run) => run.status === "shipped").length,
      blockedRuns: runs.filter((run) => run.status === "blocked-cleanly").length,
      retryAttempts: runs.reduce((total, run) => total + run.retries, 0),
      tokenBurn: runs.reduce((total, run) => total + run.tokenBurn, 0),
    },
    blockers: [...blockers.entries()].map(([state, count]) => ({ state, count })),
    nextActions: runs.map((run) => run.nextAction),
  };
}
