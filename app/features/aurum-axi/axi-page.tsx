import { Container, cardClass, cx } from "~/components/ui";

import type { AxiRun, AxiSnapshot, LogEntry, LogStatus, ProjectionYear } from "./types";

const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const num = (v: number | null | undefined, digits = 0) => (v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: digits }));
const dateLabel = (iso: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : iso;

const STATUS: Record<LogStatus, { label: string; className: string }> = {
  done: { label: "done", className: "bg-gain/15 text-gain" },
  running: { label: "running", className: "bg-chip text-link" },
  planned: { label: "planned", className: "bg-chip text-muted" },
  failed: { label: "failed", className: "bg-loss/15 text-loss" },
};

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "gain" | "loss" }) {
  return (
    <div className={cx(cardClass, "flex flex-col gap-1 p-4")}>
      <span className="text-xs uppercase tracking-wide text-subtle">{label}</span>
      <span className={cx("text-2xl font-semibold", tone === "gain" && "text-gain", tone === "loss" && "text-loss")}>{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

/** Bars of the three-year path: own account (median) with the p10-p90 band, drawn as inline SVG. */
function ProjectionChart({ years, own0 }: { years: ProjectionYear[]; own0: number }) {
  const W = 640, H = 200, P = { top: 16, right: 16, bottom: 26, left: 64 };
  const pts = [{ x: 0, p10: own0, med: own0, p90: own0 }, ...years.map((y) => ({ x: y.year, p10: y.own.p10, med: y.own.median, p90: y.own.p90 }))];
  const max = Math.max(...pts.map((p) => p.p90)) * 1.05;
  const sx = (x: number) => P.left + (x / 3) * (W - P.left - P.right);
  const sy = (v: number) => P.top + (1 - v / max) * (H - P.top - P.bottom);
  const line = (k: "p10" | "med" | "p90") => pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p[k]).toFixed(1)}`).join("");
  const band = `${line("p90")}${[...pts].reverse().map((p) => `L${sx(p.x).toFixed(1)},${sy(p.p10).toFixed(1)}`).join("")}Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full text-accent" role="img" aria-label="Projected own account over three years">
      {[0, max / 2, max].map((v) => (
        <g key={v}>
          <line x1={P.left} x2={W - P.right} y1={sy(v)} y2={sy(v)} className="stroke-border" strokeDasharray="2 4" />
          <text x={P.left - 8} y={sy(v) + 4} textAnchor="end" className="fill-muted font-mono text-[11px]">
            {usd(v)}
          </text>
        </g>
      ))}
      <path d={band} fill="currentColor" opacity={0.15} />
      <path d={line("med")} fill="none" stroke="currentColor" strokeWidth={2.5} />
      {pts.map((p) => (
        <g key={p.x}>
          <circle cx={sx(p.x)} cy={sy(p.med)} r={4} fill="currentColor" />
          <text x={sx(p.x)} y={H - 6} textAnchor="middle" className="fill-subtle font-mono text-[11px]">
            {p.x === 0 ? "start" : `year ${p.x}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

function RunCard({ r }: { r: AxiRun }) {
  const full = r.finished + r.running;
  return (
    <article className={cx(cardClass, "flex flex-col gap-4 p-5")}>
      <header className="flex flex-col gap-1">
        <h3 className="m-0 text-lg font-bold">{r.title}</h3>
        <span className="text-xs text-muted">
          {r.rules} · {r.first && dateLabel(r.first)} → {r.last && dateLabel(r.last)} · {full} weekly starts, {r.finished} finished
        </span>
      </header>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
        <Stat label="Target +7%" value={r.target_pct == null ? "—" : `${num(r.target_pct, 1)}%`} hint={`${r.target} starts`} tone="gain" />
        <Stat label="Stage stop -5.5%" value={r.stop_pct == null ? "—" : `${num(r.stop_pct, 1)}%`} hint={`${r.stop} starts`} tone={r.stop ? "loss" : undefined} />
        <Stat label="Median days" value={num(r.days_median)} hint={`p25 ${num(r.days_p25)} · p75 ${num(r.days_p75)} · p90 ${num(r.days_p90)}`} />
        <Stat label="Worst equity" value={`-${num(r.worst_equity_dd_pct, 1)}%`} hint="lowest point of any start" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-subtle">
              <th className="py-2 pr-3 font-medium">Year</th>
              <th className="py-2 pr-3 text-right font-medium">Starts</th>
              <th className="py-2 pr-3 text-right font-medium">Target</th>
              <th className="py-2 pr-3 text-right font-medium">Stop</th>
              <th className="py-2 text-right font-medium">Median days</th>
            </tr>
          </thead>
          <tbody>
            {r.years.map((y) => (
              <tr key={y.year} className="border-b border-border/60">
                <td className="py-2 pr-3 font-mono">{y.year}</td>
                <td className="py-2 pr-3 text-right">{y.starts}</td>
                <td className="py-2 pr-3 text-right text-gain">{y.target}</td>
                <td className={cx("py-2 pr-3 text-right", y.stop ? "text-loss" : "text-muted")}>{y.stop || "-"}</td>
                <td className="py-2 text-right">{num(y.median_days)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function LogItem({ e }: { e: LogEntry }) {
  const st = STATUS[e.status];
  return (
    <li className={cx(cardClass, "flex flex-col gap-2 p-4")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">{dateLabel(e.date)}</span>
        <span className={cx("rounded-md px-2 py-0.5 font-mono text-xs font-semibold", st.className)}>{st.label}</span>
        <h3 className="m-0 text-base font-semibold">{e.title}</h3>
      </div>
      <p className="m-0 text-sm text-muted">{e.summary}</p>
      {e.details && (
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
          {e.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function AxiPage({ snapshot }: { snapshot: AxiSnapshot }) {
  const { projection: pr, runs, log } = snapshot;
  const py = pr.years ?? [];
  const y3 = py[2];
  return (
    <Container className="flex flex-col gap-10 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-3xl font-bold">Aurum on Axi Select</h1>
        <p className="m-0 max-w-3xl text-sm text-muted">
          Backtest log and dashboard of the Aurum EA on an Axi Select account funded with about 5,000 EUR (5,600 USD). Every test starts the stage
          on every Monday since 2019 (+7% target, EA stop at -5.5%, Axi max loss -7%). Updated{" "}
          {new Date(snapshot.generated).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Rome" })}.
        </p>
      </header>

      <section aria-label="Three-year projection" className="flex flex-col gap-4">
        <h2 className="m-0 text-xl font-semibold">Three-year projection, if everything goes well</h2>
        {py.length && pr.own0 ? (
          <>
            <p className="m-0 max-w-3xl text-sm text-muted">
              Optimistic walk through the six Axi Select stages from {usd(pr.own0)}, replayed on {pr.historical_starts} historical weekly starts
              ({pr.first_start && dateLabel(pr.first_start)} → {pr.last_start && dateLabel(pr.last_start)}) of the{" "}
              {pr.source === "axi56" ? "Axi-data" : "IC-data"} test. Assumes the Edge Score is always high enough (Pro needs 90), the funding is always the
              maximum multiplier and the monthly profit share is reinvested in the account. Nothing here is guaranteed.
            </p>
            {y3 && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                <Stat label="Own account, year 3" value={usd(y3.own.median)} hint={`p10 ${usd(y3.own.p10)} · p90 ${usd(y3.own.p90)}`} tone="gain" />
                <Stat label="Axi capital, year 3" value={usd(y3.fund.median)} hint={`p10 ${usd(y3.fund.p10)} · p90 ${usd(y3.fund.p90)}`} />
                <Stat label="Profit share earned" value={usd(y3.earned.median)} hint={`p10 ${usd(y3.earned.p10)} · p90 ${usd(y3.earned.p90)}`} tone="gain" />
              </div>
            )}
            <div className={cx(cardClass, "p-4")}>
              <ProjectionChart years={py} own0={pr.own0} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-subtle">
                    <th className="py-2 pr-3 font-medium">End of</th>
                    <th className="py-2 pr-3 text-right font-medium">Own account (median)</th>
                    <th className="py-2 pr-3 text-right font-medium">Axi capital</th>
                    <th className="py-2 pr-3 text-right font-medium">Share earned</th>
                    <th className="py-2 font-medium">Stage reached</th>
                  </tr>
                </thead>
                <tbody>
                  {py.map((y) => (
                    <tr key={y.year} className="border-b border-border/60">
                      <td className="py-2 pr-3 font-mono">year {y.year}</td>
                      <td className="py-2 pr-3 text-right">{usd(y.own.median)}</td>
                      <td className="py-2 pr-3 text-right">{usd(y.fund.median)}</td>
                      <td className="py-2 pr-3 text-right text-gain">{usd(y.earned.median)}</td>
                      <td className="py-2 text-muted">{Object.entries(y.stage).map(([s, p]) => `${s} ${p}%`).join(" · ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="m-0 text-sm text-muted">The projection appears once enough weekly starts are finished.</p>
        )}
      </section>

      <section aria-label="Backtests" className="flex flex-col gap-4">
        <h2 className="m-0 text-xl font-semibold">Backtests</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {runs.map((r) => (
            <RunCard key={r.tag} r={r} />
          ))}
        </div>
      </section>

      <section aria-label="Log" className="flex flex-col gap-4">
        <h2 className="m-0 text-xl font-semibold">Log</h2>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {log.map((e) => (
            <LogItem key={`${e.date}-${e.title}`} e={e} />
          ))}
        </ol>
      </section>

      <p className="m-0 text-xs text-subtle">
        Backtests on historical data, Strategy Tester every tick. Past results do not guarantee future results; trading leveraged products can lose
        the whole capital. Account-level numbers only, no trades.
      </p>
    </Container>
  );
}
