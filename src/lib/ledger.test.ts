import { describe, expect, it } from "vitest";
import { buildLedger, parseRuns } from "./ledger";

describe("agent run ledger parser", () => {
  it("parses jsonl runs and summarizes shipped, blocked, retries, and token burn", () => {
    const jsonl = [
      JSON.stringify({
        id: "a",
        timestamp: "2026-05-10",
        project: "One",
        repo: "Hardik-S/one",
        status: "shipped",
        outcome: "done",
        blockerState: null,
        retries: 0,
        attemptsUsed: 1,
        tokenBurn: 100,
        evidence: ["tests passed"],
        verification: ["npm run test"],
        handoff: "safe to continue",
        nextAction: "continue",
      }),
      JSON.stringify({
        id: "b",
        timestamp: "2026-05-10",
        project: "Two",
        repo: "Hardik-S/two",
        status: "blocked-cleanly",
        outcome: "stopped",
        blockerState: "transport-blocked",
        retries: 2,
        attemptsUsed: 2,
        tokenBurn: 250,
        evidence: ["two transport failures"],
        verification: ["preflight transport-blocked"],
        handoff: "switch surface",
        nextAction: "switch surface",
      }),
    ].join("\n");

    const ledger = buildLedger(jsonl);

    expect(parseRuns(jsonl)).toHaveLength(2);
    expect(ledger.summary).toEqual({
      totalRuns: 2,
      shippedRuns: 1,
      blockedRuns: 1,
      inProgressRuns: 0,
      retryAttempts: 2,
      attemptsUsed: 3,
      tokenBurn: 350,
      evidenceItems: 2,
      verificationItems: 2,
    });
    expect(ledger.blockers).toEqual([{ state: "transport-blocked", count: 1 }]);
  });

  it("rejects jsonl records with invalid blocker states", () => {
    const run = {
      id: "bad",
      timestamp: "2026-05-10",
      project: "Bad",
      repo: "Hardik-S/bad",
      status: "blocked-cleanly",
      outcome: "stopped",
      blockerState: "github-broken",
      retries: 2,
      attemptsUsed: 2,
      tokenBurn: 100,
      evidence: [],
      verification: [],
      handoff: "stop",
      nextAction: "stop",
    };

    const jsonl = JSON.stringify(run);

    expect(() => parseRuns(jsonl)).toThrow("Invalid blockerState");
    expect(() => parseRuns(JSON.stringify({ ...run, blockerState: "toString" }))).toThrow(
      "Invalid blockerState",
    );
  });

  it("enforces status and blocker-state relationships", () => {
    const baseRun = {
      id: "state",
      timestamp: "2026-05-10",
      project: "State",
      repo: "Hardik-S/state",
      status: "blocked-cleanly",
      outcome: "stopped",
      blockerState: "transport-blocked",
      retries: 2,
      attemptsUsed: 2,
      tokenBurn: 100,
      evidence: [],
      verification: [],
      handoff: "stop",
      nextAction: "stop",
    };

    expect(() => parseRuns(JSON.stringify({ ...baseRun, status: "shipped" }))).toThrow(
      "shipped runs cannot include blockerState",
    );
    expect(() => parseRuns(JSON.stringify({ ...baseRun, blockerState: null }))).toThrow(
      "blocked-cleanly runs require blockerState",
    );
    expect(() =>
      parseRuns(JSON.stringify({ ...baseRun, status: "in-progress", blockerState: "dirty-worktree" })),
    ).toThrow("in-progress runs cannot include blockerState");
  });

  it("builds reviewer packets from evidence, verification, and handoff fields", () => {
    const ledger = buildLedger([
      {
        id: "packet",
        timestamp: "2026-05-10",
        project: "Packet",
        repo: "Hardik-S/packet",
        status: "in-progress",
        outcome: "waiting on deploy",
        blockerState: null,
        retries: 1,
        attemptsUsed: 2,
        tokenBurn: 500,
        evidence: ["branch exists", "tests pending"],
        verification: ["npm run test pending"],
        handoff: "resume deploy after package install",
        nextAction: "run build",
      },
    ]);

    expect(ledger.summary.inProgressRuns).toBe(1);
    expect(ledger.reviewerPackets).toEqual([
      {
        id: "packet",
        title: "Packet",
        status: "in-progress",
        blockerLabel: null,
        evidenceCount: 2,
        verificationCount: 1,
        handoff: "resume deploy after package install",
        nextAction: "run build",
      },
    ]);
  });
});
