import { fixtureJsonl } from "@/data/runs";
import { buildLedger, blockerLabels } from "@/lib/ledger";

export default function Home() {
  const ledger = buildLedger(fixtureJsonl);

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Synthetic fixture dashboard</p>
          <h1>Agent Run Ledger</h1>
          <p className="lede">
            A reviewer-ready observability surface for local and cloud agent
            work: shipped output, blocker discipline, retry pressure, token burn,
            and the next safe action.
          </p>
        </div>
        <div className="proof">
          <span>{ledger.summary.totalRuns} runs parsed</span>
          <strong>{ledger.summary.shippedRuns} shipped</strong>
          <span>{ledger.summary.blockedRuns} blocked cleanly</span>
        </div>
      </section>

      <section className="trustStrip" aria-label="What this proves">
        <div>
          <span>What this proves</span>
          <strong>Agent work is reviewable when every run carries evidence, retry limits, blocker state, and a continuation point.</strong>
        </div>
        <div>
          <span>Reviewer path</span>
          <strong>Inspect run packets, compare blocked-cleanly stops, then follow the documented next safe action.</strong>
        </div>
        <div>
          <span>Boundary</span>
          <strong>Synthetic fixtures only; no raw local session logs or private tokens are included.</strong>
        </div>
      </section>

      <section className="metrics" aria-label="Run metrics">
        <Metric label="Token burn" value={ledger.summary.tokenBurn.toLocaleString()} />
        <Metric label="Retry attempts" value={ledger.summary.retryAttempts.toString()} />
        <Metric label="Attempts used" value={ledger.summary.attemptsUsed.toString()} />
        <Metric label="Evidence items" value={ledger.summary.evidenceItems.toString()} />
        <Metric label="Verification items" value={ledger.summary.verificationItems.toString()} />
        <Metric label="Open next actions" value={ledger.nextActions.length.toString()} />
      </section>

      <section className="grid">
        <article className="panel wide">
          <div className="panelHead">
            <h2>Run Timeline</h2>
            <span>Evidence linked to outcomes</span>
          </div>
          <div className="timeline">
            {ledger.runs.map((run) => (
              <div className="run" key={run.id}>
                <div>
                  <strong>{run.project}</strong>
                  <span>{run.timestamp}</span>
                </div>
                <p>{run.outcome}</p>
                <div className="packetGrid" aria-label={`${run.project} reviewer evidence`}>
                  <div>
                    <span>Evidence</span>
                    <ul>
                      {run.evidence.map((item) => (
                        <li key={`${run.id}-evidence-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span>Verification</span>
                    <ul>
                      {run.verification.map((item) => (
                        <li key={`${run.id}-verification-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <footer>
                  <code>{run.repo}</code>
                  <span className={run.status === "shipped" ? "good" : run.status === "in-progress" ? "info" : "warn"}>
                    {run.status}
                  </span>
                </footer>
                <p className="handoff">
                  <strong>Handoff:</strong> {run.handoff}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panelHead">
            <h2>Blocker Taxonomy</h2>
            <span>Canonical states only</span>
          </div>
          <div className="blockers">
            {ledger.blockers.map((blocker) => (
              <div key={blocker.state}>
                <span>
                  {blockerLabels[blocker.state]}
                  <small>{blocker.state}</small>
                </span>
                <strong>{blocker.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panelHead">
            <h2>Reviewer Packets</h2>
            <span>Audit density per run</span>
          </div>
          <div className="packets">
            {ledger.reviewerPackets.map((packet) => (
              <div key={packet.id}>
                <strong>{packet.title}</strong>
                <span>{packet.status}</span>
                <p>
                  {packet.evidenceCount} evidence items, {packet.verificationCount} verification checks
                  {packet.blockerLabel ? `, blocker: ${packet.blockerLabel}` : ""}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panelHead">
            <h2>Next Actions</h2>
            <span>Safe continuation points</span>
          </div>
          <ul className="actions">
            {ledger.runs.map((run) => (
              <li key={`${run.id}-next-action`}>{run.nextAction}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
