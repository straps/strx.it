import { useCallback, useEffect, useState } from "react";
import { useRevalidator } from "react-router";

import { cx } from "~/components/ui";

import { AccountCard, ErrorCard } from "./account-card";
import { formatStamp, levelRow, money, signTone } from "./format";
import { collectAlerts, groupByFirm, hasExposure, isReadable } from "./model";
import type { Snapshot } from "./types";

const STORAGE_KEY = "trading-accounts-ui";
const ALL = "All";
const POLL_MS = 60_000;
/** The collector runs every `refresh_seconds`; this many missed runs make the data stale. */
const STALE_RUNS = 2;

interface UiState {
  firm: string;
  exposedOnly: boolean;
  open: Record<string, boolean>;
}

const initialUi: UiState = { firm: ALL, exposedOnly: false, open: {} };

function readUi(): UiState {
  try {
    return { ...initialUi, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return initialUi;
  }
}

function writeUi(ui: UiState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ui));
  } catch {
    // Private mode or blocked storage: the dashboard works, it just forgets the filters.
  }
}

function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Clock that stays null until mount, so server and client render the same first paint. */
function useNow(intervalMs: number) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function Kpi({ label, value, sub, className, big }: { label: string; value: string; sub: string; className?: string; big?: boolean }) {
  return (
    <div className="flex flex-col gap-2 bg-surface px-[22px] py-5">
      <span className="text-[13px] text-muted">{label}</span>
      <span className={cx("font-mono font-semibold tracking-[-0.02em]", big ? "text-[32px]" : "text-2xl", className)}>{value}</span>
      <span className="text-[13px] text-muted">{sub}</span>
    </div>
  );
}

function FilterChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "min-h-9 cursor-pointer rounded-full border px-3.5 text-[13px]",
        active ? "border-fg bg-fg text-bg" : "border-border text-subtle hover:bg-surface-hover",
      )}
    >
      {label} <span className="ml-1 opacity-55">{count}</span>
    </button>
  );
}

export function Dashboard({ snapshot }: { snapshot: Snapshot }) {
  const [ui, setUi] = useState(initialUi);
  const [restored, setRestored] = useState(false);
  const now = useNow(1000);
  const revalidator = useRevalidator();

  useEffect(() => {
    setUi(readUi());
    setRestored(true);
  }, []);

  const update = useCallback((change: (current: UiState) => UiState) => {
    setUi((current) => {
      const next = change(current);
      writeUi(next);
      return next;
    });
  }, []);

  // Reload the loader data while the tab is visible; the collector publishes every few minutes.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") void revalidator.revalidate();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [revalidator]);

  const { totals } = snapshot;
  const generated = new Date(snapshot.generated_at).getTime();
  const ageSeconds = now == null ? 0 : Math.max(0, Math.round((now - generated) / 1000));
  const stale = now != null && ageSeconds > snapshot.refresh_seconds * STALE_RUNS;
  const nextIn = snapshot.refresh_seconds - ageSeconds;
  const groups = groupByFirm(snapshot);
  const alerts = collectAlerts(snapshot.accounts);
  const connLevel = totals.unreachable ? "bg-loss" : totals.disconnected ? "bg-warn" : "bg-gain";
  const connText = totals.unreachable ? "text-loss" : totals.disconnected ? "text-warn" : "text-gain";
  const connSub =
    [totals.unreachable && `${totals.unreachable} errors`, totals.disconnected && `${totals.disconnected} to reconnect`].filter(Boolean).join(" · ") ||
    "0 errors";

  const jumpTo = (login: number) => {
    update((current) => ({ firm: ALL, exposedOnly: false, open: { ...current.open, [login]: true } }));
    requestAnimationFrame(() => document.getElementById(`acc-${login}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="mx-auto flex max-w-site flex-col gap-7 px-6 pt-8 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="font-mono text-xs tracking-[0.12em] text-muted uppercase">MetaTrader 5 · Prop accounts</div>
          <h1 className="m-0 text-3xl font-semibold tracking-[-0.01em]">Account status</h1>
        </div>
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] text-subtle">
          <span aria-hidden="true" className={cx("size-2 rounded-full", stale ? "bg-loss" : connLevel, !stale && "motion-safe:animate-pulse")} />
          <span>{stale ? "Stale" : "Live"} · {formatStamp(snapshot.generated_at)}</span>
          <span aria-hidden="true" className="text-dot">|</span>
          <span className="font-mono text-fg">
            refresh {now == null ? "—" : nextIn > 0 ? formatCountdown(nextIn) : "due"}
          </span>
        </div>
      </header>

      {stale && (
        <div role="alert" className={cx("rounded-lg border px-4 py-3 text-sm", levelRow.red)}>
          Data is {Math.round(ageSeconds / 60)} minutes old: the collector has not published for a while. Balances and alerts below may be outdated.
        </div>
      )}

      <section aria-label="Totals" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="col-span-2 lg:col-span-1">
          <Kpi label="Total equity" value={money(totals.equity)} sub={`on ${money(totals.initial)} nominal capital`} big />
        </div>
        <Kpi label="Open P/L" value={money(totals.open_pl, { sign: true })} sub={`${totals.positions} positions · ${totals.orders} orders`} className={signTone(totals.open_pl)} />
        <Kpi label="Today" value={money(totals.closed_today, { sign: true })} sub="realized" className={signTone(totals.closed_today)} />
        <Kpi label="Connection" value={`${totals.reachable}/${totals.accounts}`} sub={connSub} className={connText} />
      </section>

      {alerts.length > 0 ? (
        <section aria-label="Alerts" className="flex flex-col gap-1.5">
          <div className="px-1 text-[13px] text-muted">
            To watch · {totals.alerts_red} critical · {totals.alerts_yellow} warnings
          </div>
          {alerts.map((alert) => (
            <button
              key={`${alert.login}-${alert.text}`}
              type="button"
              onClick={() => jumpTo(alert.login)}
              className={cx("flex cursor-pointer flex-wrap items-baseline gap-x-2.5 rounded-lg border px-3 py-2 text-left text-[13px]", levelRow[alert.level])}
            >
              <span aria-hidden="true" className="font-semibold">●</span>
              <span className="font-mono text-muted">{alert.login}</span>
              <span className="text-fg">{alert.text}</span>
              <span className="ml-auto max-w-full truncate text-xs text-muted sm:max-w-[40%]">{alert.label}</span>
            </button>
          ))}
        </section>
      ) : (
        <div className="px-1 text-[13px] text-gain">✓ No prop rule at risk, no automation out of state</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter by prop firm" className="flex flex-wrap gap-1.5">
          <FilterChip label={ALL} count={snapshot.accounts.length} active={ui.firm === ALL} onClick={() => update((c) => ({ ...c, firm: ALL }))} />
          {groups.map((group) => (
            <FilterChip key={group.firm} label={group.firm} count={group.accounts.length} active={ui.firm === group.firm} onClick={() => update((c) => ({ ...c, firm: group.firm }))} />
          ))}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ui.exposedOnly}
          onClick={() => update((c) => ({ ...c, exposedOnly: !c.exposedOnly }))}
          className={cx(
            "flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-border px-3.5 text-[13px]",
            ui.exposedOnly ? "text-fg" : "text-subtle",
          )}
        >
          <span aria-hidden="true" className={cx("relative inline-block h-3.5 w-[26px] rounded-full", ui.exposedOnly ? "bg-gain" : "bg-surface-hover")}>
            <span className={cx("absolute top-0.5 size-2.5 rounded-full bg-fg transition-[left]", ui.exposedOnly ? "left-3.5" : "left-0.5")} />
          </span>
          Only accounts with exposure
        </button>
      </div>

      {groups.map((group) => {
        const visible = group.accounts.filter(
          (account) => (ui.firm === ALL || ui.firm === group.firm) && (!ui.exposedOnly || hasExposure(account)),
        );
        if (!visible.length) return null;
        return (
          <section key={group.firm} aria-label={group.firm} className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-3 px-1">
              <div className="flex items-baseline gap-2.5">
                <h2 className="m-0 text-base font-semibold">{group.firm}</h2>
                <span className="text-[13px] text-muted">{group.accounts.length} accounts</span>
              </div>
              <div className="flex gap-4 font-mono text-[13px] text-muted">
                <span>Eq <b className="font-medium text-fg">{money(group.equity)}</b></span>
                <span>P/L <b className={cx("font-medium", signTone(group.openPl))}>{money(group.openPl, { sign: true })}</b></span>
              </div>
            </div>
            {visible.map((account) =>
              isReadable(account) ? (
                <AccountCard
                  key={account.login}
                  account={account}
                  open={restored && !!ui.open[account.login]}
                  onToggle={() => update((c) => ({ ...c, open: { ...c.open, [account.login]: !c.open[account.login] } }))}
                />
              ) : (
                <ErrorCard key={account.login} account={account} />
              ),
            )}
          </section>
        );
      })}

      <footer className="text-center font-mono text-xs text-dot">
        data via MT5 MCP · published every {Math.round(snapshot.refresh_seconds / 60)} min · margin bar: from −max loss to +target of each account
      </footer>
    </div>
  );
}
