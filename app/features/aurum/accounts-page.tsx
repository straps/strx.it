import { Icon } from "~/components/icons";
import { ButtonLink, Container, Section, cardClass, cx } from "~/components/ui";

import type { AccountStatus, AurumAccount, AurumAccountsSnapshot } from "./accounts-types";

const pct = (v: number | null | undefined, digits = 2) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
const money = (v: number | null | undefined, cur: string) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v);
const signedMoney = (v: number | null | undefined, cur: string) => (v == null ? "—" : `${v > 0 ? "+" : ""}${money(v, cur)}`);
const tone = (v: number | null | undefined) => (v == null || v === 0 ? "text-muted" : v > 0 ? "text-gain" : "text-loss");
const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const STATUS: Record<AccountStatus, { label: string; className: string }> = {
  running: { label: "live", className: "bg-gain/15 text-gain" },
  starting: { label: "starting", className: "bg-chip text-link" },
  "target reached": { label: "target reached", className: "bg-gain/15 text-gain" },
  "limit breached": { label: "limit breached", className: "bg-loss/15 text-loss" },
  closed: { label: "closed", className: "bg-chip text-muted" },
  "no data": { label: "no data", className: "bg-chip text-muted" },
};

function Bar({ value, className }: { value: number; className: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-border">
      <div className={cx("h-full rounded-full", className)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function Spark({ points }: { points: { pnl_pct: number }[] }) {
  if (points.length < 2) return null;
  const w = 120, h = 32;
  const vals = points.map((p) => p.pnl_pct);
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), span = hi - lo || 1;
  const xy = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - lo) / span) * h}`).join(" ");
  const last = vals[vals.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-30" aria-hidden="true">
      <line x1="0" x2={w} y1={h - ((0 - lo) / span) * h} y2={h - ((0 - lo) / span) * h} className="stroke-border" strokeDasharray="2 3" />
      <polyline points={xy} fill="none" strokeWidth="2" className={last >= 0 ? "stroke-gain" : "stroke-loss"} />
    </svg>
  );
}

function AccountCard({ a }: { a: AurumAccount }) {
  const st = STATUS[a.status] ?? STATUS["no data"];
  const starting = a.status === "starting";
  return (
    <article className={cx(cardClass, "flex flex-col gap-4")}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {a.firm} · {a.platform} · {a.login}
          </span>
          <h3 className="m-0 text-lg font-bold">{a.program}</h3>
          <span className="text-sm text-accent">{a.ea}</span>
          <span className="text-xs text-muted">{a.variant}</span>
        </div>
        <span className={cx("shrink-0 rounded-md px-2 py-1 font-mono text-xs font-semibold", st.className)}>{st.label}</span>
      </header>

      {starting ? (
        <p className="m-0 text-sm text-muted">Aurum starts on {a.since ? dateLabel(a.since) : "the next session"}: numbers from the next update.</p>
      ) : (
        <>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-mono text-xs text-muted">{a.kind === "own" ? "growth" : "result"}</span>
              <span className={cx("font-mono text-3xl font-bold", tone(a.pnl_pct))}>{pct(a.pnl_pct)}</span>
              {a.pnl != null && <span className={cx("font-mono text-sm", tone(a.pnl))}>{signedMoney(a.pnl, a.currency)}</span>}
            </div>
            <Spark points={a.history} />
          </div>

          {a.kind === "prop" ? (
            <div className="flex flex-col gap-3 font-mono text-xs">
              {a.target != null && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-muted">
                    <span>to target {money(a.target, a.currency)}</span>
                    <span>{(a.target_progress_pct ?? 0).toFixed(0)}%</span>
                  </div>
                  <Bar value={a.target_progress_pct ?? 0} className="bg-gain" />
                </div>
              )}
              {a.loss_room != null && (
                <div className="flex justify-between text-muted">
                  <span>room to loss limit</span>
                  <span className={cx((a.loss_room_pct ?? 0) < 3 ? "text-loss" : "text-fg")}>
                    {money(a.loss_room, a.currency)} ({(a.loss_room_pct ?? 0).toFixed(1)}%)
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>balance</span>
                <span className="text-fg">{money(a.balance, a.currency)}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-muted">max drawdown</span>
                <span>{a.max_dd_pct != null ? `${a.max_dd_pct.toFixed(1)}%` : "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted">from peak now</span>
                <span>{a.dd_now_pct != null ? `${a.dd_now_pct.toFixed(1)}%` : "—"}</span>
              </div>
              {a.note && <p className="col-span-2 m-0 text-muted">{a.note}</p>}
            </div>
          )}
        </>
      )}
    </article>
  );
}

export function AccountsPage({ snapshot }: { snapshot: AurumAccountsSnapshot }) {
  const s = snapshot.summary;
  const order: AccountStatus[] = ["running", "target reached", "starting", "limit breached", "closed", "no data"];
  const accounts = [...snapshot.accounts].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  return (
    <>
      <section aria-labelledby="accounts-title" className="relative">
        <div aria-hidden="true" className="hero-glow absolute inset-x-0 -top-24 bottom-0 -z-10" />
        <Container className="flex flex-col gap-6 pt-16 pb-12 md:pt-24">
          <a href="/aurum" className="inline-flex items-center gap-2 self-start font-mono text-sm text-link no-underline hover:underline">
            ← Aurum Switch
          </a>
          <h1 id="accounts-title" className="m-0 text-4xl leading-tight font-bold tracking-[-0.03em] md:text-[52px] md:leading-[60px]">
            Every Aurum account
          </h1>
          <p className="m-0 max-w-160 text-xl text-muted">
            The Aurum family runs on one own account and several prop-firm accounts, each with its own rules and its own
            variant. The same numbers, good or bad, updated every Monday morning.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-4">
            {[
              ["accounts", s.accounts],
              ["live", s.running],
              ["starting", s.starting],
              ["in profit", s.positive],
              ["targets reached", s.targets],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 rounded-xl border border-border bg-bg p-4">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</span>
                <span className="font-mono text-2xl font-bold">{value}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Section id="accounts" eyebrow="accounts" title="Status by account" className="bg-surface">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
          {accounts.map((a) => (
            <AccountCard key={a.key} a={a} />
          ))}
        </div>
        <p className="m-0 font-mono text-xs text-muted">
          Updated {dateLabel(snapshot.generated)} · prop results are measured from when Aurum took over the account ·
          logins masked · account-level numbers only, no trades or positions. Prop-firm accounts are evaluations on
          simulated capital; past results do not guarantee future results.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/aurum" variant="outline">
            How Aurum works
            <Icon name="arrowUpRight" />
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
