import type { ReactNode } from "react";

import { cx } from "~/components/ui";

import { levelChip, levelDot, levelText, money, signTone } from "./format";
import { accountLevel, hasExposure, marginBar, openPl } from "./model";
import { PositionRow } from "./position-row";
import type { Account, Level } from "./types";

function MarginBarView({ account }: { account: Account }) {
  const bar = marginBar(account);
  if (!bar) return null;
  const trailing = account.max_loss_trailing;
  const fill = bar.tone === "gain" ? "bg-gain" : bar.tone === "loss" ? "bg-loss" : "bg-muted";
  const percent = `${bar.changePct > 0 ? "+" : bar.changePct < 0 ? "−" : ""}${Math.abs(bar.changePct).toFixed(2)}%`;
  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex justify-between font-mono text-xs text-muted">
        <span>max loss −{money(bar.maxLoss)}</span>
        <span className={cx("font-semibold", bar.tone === "gain" ? "text-gain" : bar.tone === "loss" ? "text-loss" : "text-muted")}>{percent}</span>
        <span>{bar.hasTarget ? `target +${money(bar.right)}` : `+${money(bar.right)}`}</span>
      </span>
      <span className="relative block h-1.5 rounded-full bg-surface-hover">
        <span className={cx("absolute inset-y-0 rounded-full", fill)} style={{ left: `${bar.fillLeftPct}%`, width: `${bar.fillWidthPct}%` }} />
        <span className="absolute -inset-y-[3px] w-0.5 bg-dot" style={{ left: `${bar.zeroPct}%` }} />
      </span>
      <span className="text-xs text-muted">
        {money(account.max_loss_room)} of room on max loss{trailing && " · trailing"}
        {!account.rules.max_loss && <span className="text-warn"> ⚠︎ rule missing</span>}
      </span>
    </span>
  );
}

/** Compact badges under the margin bar: only what has a rule on the account. */
function Chips({ account }: { account: Account }) {
  const metrics = account.metrics;
  if (!metrics) return null;
  const chips: Array<{ level: Level; text: string; title?: string }> = [];
  const { daily, risk, algo, inactivity } = metrics;
  if (daily) {
    chips.push({
      level: daily.level,
      text: `daily ${money(Math.max(daily.room, 0))} / ${money(daily.amount)}${daily.approx ? " ≈" : ""}`,
      title: `daily floor ${money(daily.floor)} (reset ${daily.reset ?? "server"})${daily.approx ? ` · ≈ ${daily.approx}` : ""}`,
    });
  }
  if (risk.amount) {
    chips.push({ level: risk.level, text: `risk ${money(risk.total)} / ${money(risk.amount)}`, title: "Sum of the losses at SL of positions and pending orders" });
  } else if (risk.total) {
    chips.push({ level: "na", text: `risk ${money(risk.total)}`, title: "Sum of the losses at SL (no cap in the account rules)" });
  }
  if (risk.missing_sl.length) chips.push({ level: "red", text: `${risk.missing_sl.length} without SL`, title: risk.missing_sl.join(", ") });
  if (algo.mismatch) chips.push({ level: "red", text: `Algo ${algo.actual ? "ON" : "OFF"}!`, title: "Algo Trading state differs from the account card" });
  if (inactivity && inactivity.level !== "green") {
    chips.push({ level: inactivity.level, text: `inactivity ${inactivity.left}d`, title: `last closed trade ${inactivity.days} days ago, limit ${inactivity.limit}` });
  }
  if (!chips.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span key={chip.text} title={chip.title} className={cx("rounded-[5px] border px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap", levelChip[chip.level])}>
          {chip.text}
        </span>
      ))}
    </span>
  );
}

function Stat({ label, value, sub, className }: { label: string; value: ReactNode; sub?: string; className?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-border px-3 py-2.5">
      <span className="text-[11px] tracking-[0.06em] text-muted uppercase">{label}</span>
      <span className={cx("font-mono text-sm font-semibold", className)}>{value}</span>
      {sub && <span className="text-[11px] text-muted">{sub}</span>}
    </div>
  );
}

/** "Prop rules" panel: state of every goal and limit of the account. */
function RulesPanel({ account }: { account: Account }) {
  const metrics = account.metrics;
  if (!metrics) return null;
  const { target, daily, risk, trading_days, profitable_days, consistency, inactivity, deadline, payout, algo, executor, crons, to_verify } = metrics;
  return (
    <>
      <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]">
        <Stat label="Phase" value={metrics.phase ?? "—"} sub={[account.mode, account.trade_policy].filter(Boolean).join(" · ")} />
        {target && (
          <Stat
            label="Target"
            value={target.left > 0 ? money(target.left) : "reached ✓"}
            sub={target.left > 0 ? `to go for ${money(target.amount)}` : `goal ${money(target.amount)}`}
            className={target.left <= 0 ? "text-gain" : undefined}
          />
        )}
        {daily && (
          <Stat
            label="Daily loss"
            value={`${money(Math.max(daily.room, 0))} left`}
            sub={`floor ${money(daily.floor)} · limit ${money(daily.amount)}${daily.approx ? " · estimate" : ""}${daily.hard ? " · hard" : ""}`}
            className={levelText[daily.level]}
          />
        )}
        {(risk.amount || risk.total > 0) && (
          <Stat
            label="Open risk"
            value={`${money(risk.total)}${risk.amount ? ` / ${money(risk.amount)}` : ""}`}
            sub={`${risk.soft ? `soft limit ${money(risk.soft)}` : "sum of SL of positions + pending"}${risk.missing_sl.length ? ` · ${risk.missing_sl.length} without SL` : ""}`}
            className={risk.amount || risk.missing_sl.length ? levelText[risk.level] : undefined}
          />
        )}
        {trading_days && (
          <Stat label="Trading days" value={`${trading_days.done} / ${trading_days.need}`} sub="since phase start" className={trading_days.done >= trading_days.need ? "text-gain" : undefined} />
        )}
        {profitable_days && (
          <Stat
            label="Profitable days"
            value={`${profitable_days.done} / ${profitable_days.need}`}
            sub={`≥ ${money(profitable_days.min_amount)} net`}
            className={profitable_days.done >= profitable_days.need ? "text-gain" : undefined}
          />
        )}
        {consistency && (
          <Stat
            label="Consistency"
            value={consistency.ok ? "ok" : `${consistency.share?.toFixed(0) ?? "—"}% > ${consistency.pct}%`}
            sub={`best day ${money(consistency.best, { sign: true })}${consistency.needed_total ? ` · needs profit ${money(consistency.needed_total)}` : ""}`}
            className={consistency.ok ? "text-gain" : "text-warn"}
          />
        )}
        {inactivity && (
          <Stat label="Inactivity" value={`${inactivity.left} days`} sub={`last closed trade ${inactivity.days}d ago · limit ${inactivity.limit}`} className={levelText[inactivity.level]} />
        )}
        {deadline && (
          <Stat label="Phase deadline" value={`${deadline.left} days`} sub={deadline.date} className={deadline.left <= 5 ? "text-loss" : deadline.left <= 14 ? "text-warn" : undefined} />
        )}
        {payout && !payout.eval && payout.threshold != null && (
          <Stat
            label="Payout"
            value={payout.ready ? "available ✓" : `${money(Math.max(payout.threshold - (payout.profit ?? 0), 0))} to threshold`}
            sub={`yours ${money(payout.yours)} (${payout.split}%) · ${payout.frequency ?? ""}`}
            className={payout.ready ? "text-gain" : undefined}
          />
        )}
        {payout?.eval && <Stat label="Payout (funded)" value={`split ${payout.split}%`} sub={payout.frequency ?? ""} />}
        {algo.expected != null && (
          <Stat
            label="Algo Trading"
            value={`${algo.actual ? "ON" : "OFF"}${algo.mismatch ? " ⚠︎" : ""}`}
            sub={`expected ${algo.expected ? "ON" : "OFF"}`}
            className={algo.mismatch ? "text-loss" : undefined}
          />
        )}
        {executor?.name && (
          <Stat
            label="Executor"
            value={executor.state ?? (executor.type === "hermes_cron" ? "cron" : "—")}
            sub={executor.name.slice(0, 48)}
            className={executor.down ? "text-loss" : undefined}
          />
        )}
        {crons.map((cron) => (
          <Stat
            key={cron.id}
            label="Cron"
            value={`${cron.missing ? "not found" : cron.actual ? "active" : "paused"}${cron.mismatch || cron.missing ? " ⚠︎" : ""}`}
            sub={`${cron.id} · ${cron.name.slice(0, 44)}`}
            className={cron.mismatch || cron.missing ? "text-warn" : undefined}
          />
        ))}
      </div>
      {to_verify.length > 0 && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer text-warn">⚠︎ {to_verify.length} rules to verify</summary>
          <ul className="mt-1.5 ml-4 p-0">
            {to_verify.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function ClosedStrip({ account }: { account: Account }) {
  const closed = account.metrics?.closed;
  if (!closed) return null;
  const parts = [
    ["Today", closed.today],
    ["Yesterday", closed.yesterday],
    ["7d", closed.week],
  ] as const;
  return (
    <div className="flex flex-wrap gap-x-7 gap-y-1 font-mono text-[13px] text-muted">
      {parts.map(([label, part]) => (
        <span key={label}>
          {label} <b className={cx("font-medium", signTone(part.pnl))}>{money(part.pnl, { sign: true, decimals: 2 })}</b> · {part.trades} closed
        </span>
      ))}
    </div>
  );
}

interface AccountCardProps {
  account: Account;
  open: boolean;
  onToggle: () => void;
}

/** Card of a readable account: summary row, expandable detail. */
export function AccountCard({ account, open, onToggle }: AccountCardProps) {
  const exposed = hasExposure(account);
  const pl = openPl(account);
  const today = account.metrics?.closed.today.pnl ?? 0;
  const toVerify = account.metrics?.to_verify ?? [];
  const panelId = `acc-detail-${account.login}`;
  return (
    <article id={`acc-${account.login}`} className={cx("overflow-hidden rounded-xl border bg-surface", open ? "border-border" : "border-border/60")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="grid w-full cursor-pointer items-center gap-x-6 gap-y-3.5 px-5 py-4 text-left text-fg hover:bg-surface-hover lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_auto]"
      >
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="flex min-w-0 flex-wrap items-center gap-2.5">
            <span aria-hidden="true" className={cx("size-[7px] shrink-0 rounded-full", levelDot[accountLevel(account)])} />
            <span className="font-mono text-[13px] text-muted">{account.login}</span>
            <span className="rounded-[5px] bg-chip px-1.5 py-0.5 font-mono text-[11px] text-subtle" title={`program size ${money(account.size)}`}>
              {account.initial_balance / 1000}K
            </span>
            {account.trade_policy === "read_only" && (
              <span className="rounded-[5px] border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted" title="trade_policy read_only: never orders via MCP">
                manual
              </span>
            )}
            {toVerify.length > 0 && <span className="font-mono text-[10px] text-warn">⚠︎ {toVerify.length} to verify</span>}
          </span>
          <span className="truncate text-[15px] font-medium" title={account.label}>
            {account.label}
          </span>
        </span>

        <span className="flex min-w-0 flex-col gap-1.5">
          <MarginBarView account={account} />
          <Chips account={account} />
        </span>

        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex flex-col items-end gap-0.5 font-mono">
            <span className="text-[17px] font-semibold">{money(account.equity)}</span>
            <span className="text-xs text-muted">bal {money(account.balance)}</span>
          </span>
          <span className="flex min-w-[92px] flex-col gap-1 font-mono text-xs">
            <span className="flex justify-between gap-2 text-muted">
              P/L <b className={cx("font-medium", signTone(pl))}>{money(pl, { sign: true })}</b>
            </span>
            <span className="flex justify-between gap-2 text-muted">
              Today <b className={cx("font-medium", signTone(today))}>{money(today, { sign: true })}</b>
            </span>
          </span>
          <span className="min-w-[70px] text-right text-xs text-subtle">
            {exposed ? `${account.positions.length} pos · ${account.orders.length} ord` : "flat"}
          </span>
          <span aria-hidden="true" className="w-2.5 text-xs text-muted">
            {open ? "▴" : "▾"}
          </span>
        </span>
      </button>

      {open && (
        <div id={panelId} className="flex flex-col gap-4 border-t border-border bg-bg/60 px-5 pt-[18px] pb-5">
          <RulesPanel account={account} />
          {exposed ? (
            <div className="flex flex-col gap-2.5">
              {account.positions.map((position) => (
                <PositionRow key={position.id} row={position} />
              ))}
              {account.orders.map((order) => (
                <PositionRow key={order.id} row={order} />
              ))}
            </div>
          ) : (
            <div className="text-[13px] text-muted">No open position or pending order.</div>
          )}
          <ClosedStrip account={account} />
        </div>
      )}
    </article>
  );
}

/** Card of an account that could not be read (disconnected or unreachable). */
export function ErrorCard({ account }: { account: Account }) {
  const disconnected = account.state === "disconnected";
  return (
    <article
      id={`acc-${account.login}`}
      className={cx("flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-surface px-5 py-4", disconnected ? "border-warn/45" : "border-loss/45")}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className={cx("size-[7px] rounded-full", disconnected ? "bg-warn" : "bg-loss")} />
          <span className="font-mono text-[13px] text-muted">{account.login}</span>
        </div>
        <div className="text-[15px] font-medium">{account.label}</div>
      </div>
      <div className="text-right font-mono text-xs">
        {disconnected ? (
          <>
            <span className="text-warn">⚠︎ not connected to the broker</span>
            <br />
            <span className="text-muted">last balance {money(account.balance)} · probably a Login window waiting for the password</span>
          </>
        ) : (
          <>
            <span className="text-loss">⚠︎ unreachable</span>
            <br />
            <span className="text-muted">{account.state}</span>
          </>
        )}
      </div>
    </article>
  );
}
