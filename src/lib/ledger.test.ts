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
        tokenBurn: 100,
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
        tokenBurn: 250,
        nextAction: "switch surface",
      }),
    ].join("\n");

    const ledger = buildLedger(jsonl);

    expect(parseRuns(jsonl)).toHaveLength(2);
    expect(ledger.summary).toEqual({
      totalRuns: 2,
      shippedRuns: 1,
      blockedRuns: 1,
      retryAttempts: 2,
      tokenBurn: 350,
    });
    expect(ledger.blockers).toEqual([{ state: "transport-blocked", count: 1 }]);
  });
});
