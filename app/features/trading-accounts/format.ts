import type { Level } from "./types";

/** `$1,234` / `+$1,234.50` / `−$12`; `—` when the value is missing. */
export function money(value: number | null | undefined, { sign = false, decimals = 0 } = {}) {
  if (value == null) return "—";
  const prefix = value < 0 ? "−" : sign && value > 0 ? "+" : "";
  return `${prefix}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function plain(value: number | string | null | undefined) {
  if (value == null || value === "") return "—";
  return typeof value === "number" ? String(Number(value.toPrecision(10))) : value;
}

/** Text color for a signed amount. */
export function signTone(value: number | null | undefined) {
  return value ? (value > 0 ? "text-gain" : "text-loss") : "text-fg";
}

export const levelText: Record<Level, string> = {
  green: "text-gain",
  yellow: "text-warn",
  red: "text-loss",
  breach: "text-loss",
  na: "text-subtle",
};

/** Outlined small badge. */
export const levelChip: Record<Level, string> = {
  green: "border-gain/35 text-gain",
  yellow: "border-warn/35 text-warn",
  red: "border-loss/35 text-loss",
  breach: "border-loss/35 text-loss",
  na: "border-border text-muted",
};

/** Tinted full-width alert row. */
export const levelRow: Record<Level, string> = {
  green: "border-gain/25 bg-gain/8 text-gain",
  yellow: "border-warn/25 bg-warn/8 text-warn",
  red: "border-loss/25 bg-loss/8 text-loss",
  breach: "border-loss/25 bg-loss/8 text-loss",
  na: "border-border bg-surface text-muted",
};

export const levelDot: Record<Level, string> = {
  green: "bg-gain",
  yellow: "bg-warn",
  red: "bg-loss",
  breach: "bg-loss",
  na: "bg-dot",
};

export const levelRank: Record<Level, number> = { breach: 0, red: 0, yellow: 1, green: 2, na: 3 };

/** Timestamp in the owner's time zone; fixed so server and client render the same text. */
export function formatStamp(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
