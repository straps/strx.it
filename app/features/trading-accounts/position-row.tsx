import { cx } from "~/components/ui";

import { money, plain, signTone } from "./format";
import type { PendingOrder, Position } from "./types";

type Row = Position | PendingOrder;

const clamp = (value: number) => Math.max(0, Math.min(100, value));

/** SL → TP track with the entry mark and a dot on the current price. */
function RangeBar({ row, pending }: { row: Row; pending: boolean }) {
  const open = "open_price" in row ? row.open_price : row.price;
  const now = "current_price" in row ? row.current_price : null;
  if (row.sl && row.tp && row.tp !== row.sl) {
    const range = row.tp - row.sl;
    const entry = clamp(((open - row.sl) / range) * 100);
    const current = clamp((((now ?? open) - row.sl) / range) * 100);
    return (
      <div
        className="relative h-2 rounded-full"
        style={{
          background: `linear-gradient(90deg, color-mix(in oklab, var(--color-loss) 35%, transparent), var(--color-surface-hover) ${entry}%, color-mix(in oklab, var(--color-gain) 35%, transparent))`,
        }}
      >
        <div className="absolute -inset-y-1 w-px bg-muted" style={{ left: `${entry}%` }} />
        {!pending && now != null && (
          <div className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-[3px] border-bg bg-fg" style={{ left: `${current}%` }} />
        )}
      </div>
    );
  }
  if (row.sl || row.tp) return <div className="h-2 rounded-full bg-surface-hover" />;
  return (
    <div
      role="img"
      aria-label="No stop loss"
      className="h-2 rounded-full"
      style={{ background: "repeating-linear-gradient(90deg, var(--color-surface-hover) 0 6px, transparent 6px 10px)" }}
    />
  );
}

/** One open position or pending order of an account. */
export function PositionRow({ row }: { row: Row }) {
  const pending = "type" in row;
  const side = pending ? row.type : row.side;
  const buy = side.toUpperCase().startsWith("BUY");
  const price = pending ? row.price : row.open_price;
  const now = pending ? null : row.current_price;
  return (
    <div
      className={cx(
        "grid items-center gap-x-6 gap-y-3 rounded-lg border border-border p-3.5 md:grid-cols-[170px_minmax(0,1fr)_130px]",
        pending && "border-dashed",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <b className="text-sm">{row.symbol}</b>
          <span className={cx("rounded px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", buy ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss")}>
            {side.toUpperCase()} {plain(row.volume)}
          </span>
        </div>
        <span className="font-mono text-xs text-muted">
          R:R {plain(row.rr)}
          {!row.sl && <span className="text-loss"> ⚠︎ no SL</span>}
        </span>
        {row.comment && <span className="truncate font-mono text-[11px] text-subtle" title={row.comment}>{row.comment}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <RangeBar row={row} pending={pending} />
        <div className="flex flex-wrap justify-between gap-2 font-mono text-[11px] text-muted">
          <span>
            SL {plain(row.sl)} <span className="text-loss">{row.sl_money != null && money(row.sl_money, { sign: true })}</span>
          </span>
          <span>
            {pending ? "price" : "open"} {plain(price)}
            {now != null && (
              <>
                {" → "}
                <b className="font-medium text-fg">{plain(now)}</b>
              </>
            )}
          </span>
          <span>
            TP {plain(row.tp)} <span className="text-gain">{row.tp_money != null && money(row.tp_money, { sign: true })}</span>
          </span>
        </div>
      </div>

      <div className={cx("font-mono text-base font-semibold md:text-right", pending ? "text-muted" : signTone(row.profit))}>
        {pending ? "pending" : money(row.profit, { sign: true, decimals: 2 })}
      </div>
    </div>
  );
}
