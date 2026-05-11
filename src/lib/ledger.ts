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
  attemptsUsed: number;
  tokenBurn: number;
  evidence: readonly string[];
  verification: readonly string[];
  handoff: string;
  nextAction: string;
};

export function parseRuns(input: string | readonly RawRun[]): RawRun[] {
  if (typeof input !== "string") {
    return input.map(validateRun);
  }

  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => validateRun(JSON.parse(line), index + 1));
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
      inProgressRuns: runs.filter((run) => run.status === "in-progress").length,
      retryAttempts: runs.reduce((total, run) => total + run.retries, 0),
      attemptsUsed: runs.reduce((total, run) => total + run.attemptsUsed, 0),
      tokenBurn: runs.reduce((total, run) => total + run.tokenBurn, 0),
      evidenceItems: runs.reduce((total, run) => total + run.evidence.length, 0),
      verificationItems: runs.reduce((total, run) => total + run.verification.length, 0),
    },
    blockers: [...blockers.entries()].map(([state, count]) => ({ state, count })),
    nextActions: runs.map((run) => run.nextAction),
    reviewerPackets: runs.map((run) => ({
      id: run.id,
      title: run.project,
      status: run.status,
      blockerLabel: run.blockerState ? blockerLabels[run.blockerState] : null,
      evidenceCount: run.evidence.length,
      verificationCount: run.verification.length,
      handoff: run.handoff,
      nextAction: run.nextAction,
    })),
  };
}

function validateRun(value: unknown, lineNumber?: number): RawRun {
  const prefix = lineNumber ? `Run record line ${lineNumber}` : "Run record";

  if (!isPlainRecord(value)) {
    throw new Error(`${prefix} must be an object`);
  }

  const run = value as Partial<RawRun>;
  requireString(run.id, "id", prefix);
  requireString(run.timestamp, "timestamp", prefix);
  requireString(run.project, "project", prefix);
  requireString(run.repo, "repo", prefix);
  requireString(run.outcome, "outcome", prefix);
  requireString(run.handoff, "handoff", prefix);
  requireString(run.nextAction, "nextAction", prefix);
  requireStatus(run.status, prefix);
  requireBlockerState(run.blockerState, prefix);
  requireNumber(run.retries, "retries", prefix);
  requireNumber(run.attemptsUsed, "attemptsUsed", prefix);
  requireNumber(run.tokenBurn, "tokenBurn", prefix);
  requireStringArray(run.evidence, "evidence", prefix);
  requireStringArray(run.verification, "verification", prefix);
  requireStatusBlockerRelationship(run.status, run.blockerState, prefix);

  return run as RawRun;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string, prefix: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${prefix} has invalid ${field}`);
  }
}

function requireNumber(value: unknown, field: string, prefix: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${prefix} has invalid ${field}`);
  }
}

function requireStringArray(value: unknown, field: string, prefix: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${prefix} has invalid ${field}`);
  }
}

function requireStatus(value: unknown, prefix: string) {
  if (value !== "shipped" && value !== "blocked-cleanly" && value !== "in-progress") {
    throw new Error(`${prefix} has invalid status`);
  }
}

function requireBlockerState(value: unknown, prefix: string) {
  if (value !== null && !(typeof value === "string" && Object.hasOwn(blockerLabels, value))) {
    throw new Error(`${prefix} has Invalid blockerState`);
  }
}

function requireStatusBlockerRelationship(
  status: RawRun["status"] | undefined,
  blockerState: RawRun["blockerState"] | undefined,
  prefix: string,
) {
  if (status === "shipped" && blockerState !== null) {
    throw new Error(`${prefix}: shipped runs cannot include blockerState`);
  }

  if (status === "blocked-cleanly" && blockerState === null) {
    throw new Error(`${prefix}: blocked-cleanly runs require blockerState`);
  }

  if (status === "in-progress" && blockerState !== null) {
    throw new Error(`${prefix}: in-progress runs cannot include blockerState`);
  }
}
