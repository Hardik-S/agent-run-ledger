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

      <section className="metrics" aria-label="Run metrics">
        <Metric label="Token burn" value={ledger.summary.tokenBurn.toLocaleString()} />
        <Metric label="Retry attempts" value={ledger.summary.retryAttempts.toString()} />
        <Metric label="Open next actions" value={ledger.nextActions.length.toString()} />
        <Metric label="Blocker classes" value={ledger.blockers.length.toString()} />
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
                <footer>
                  <code>{run.repo}</code>
                  <span className={run.status === "shipped" ? "good" : "warn"}>
                    {run.status}
                  </span>
                </footer>
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
                <span>{blockerLabels[blocker.state]}</span>
                <strong>{blocker.count}</strong>
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
            {ledger.nextActions.map((action) => (
              <li key={action}>{action}</li>
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
