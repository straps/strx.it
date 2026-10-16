import { levelRank } from "./format";
import type { Account, Alert, Level, Snapshot } from "./types";

export interface MarginBar {
  maxLoss: number;
  right: number;
  hasTarget: boolean;
  zeroPct: number;
  fillLeftPct: number;
  fillWidthPct: number;
  changePct: number;
  tone: "gain" | "loss" | "flat";
}

/** Bar from −max loss to +target (or +max loss without target); the zero mark is the starting capital. */
export function marginBar(account: Account): MarginBar | null {
  if (account.equity == null) return null;
  const size = account.initial_balance;
  const maxLoss = account.rules.max_loss?.amount ?? size * 0.1;
  const target = account.rules.profit_target?.amount;
  const right = target ?? maxLoss;
  const span = maxLoss + right;
  const zeroPct = (maxLoss / span) * 100;
  const change = account.equity - size;
  const position = Math.max(0, Math.min(100, ((change + maxLoss) / span) * 100));
  return {
    maxLoss,
    right,
    hasTarget: target != null,
    zeroPct,
    fillLeftPct: Math.min(zeroPct, position),
    fillWidthPct: Math.abs(position - zeroPct),
    changePct: (change / size) * 100,
    tone: change > 0 ? "gain" : change < 0 ? "loss" : "flat",
  };
}

export function isReadable(account: Account) {
  return account.state === "ok" && account.equity != null;
}

export function openPl(account: Account) {
  return (account.equity ?? 0) - (account.balance ?? 0);
}

/** Overall health dot of a card. */
export function accountLevel(account: Account): Level {
  const alerts = account.metrics?.alerts ?? [];
  const worst = Math.min(9, ...alerts.map((alert) => levelRank[alert.level]));
  const room = account.max_loss_room;
  if (worst === 0 || (room != null && room / account.initial_balance < 0.03)) return "red";
  if (worst === 1 || account.positions.length > 0) return "yellow";
  return "green";
}

export interface AlertItem extends Alert {
  login: number;
  label: string;
}

/** Alerts of every account, critical first. */
export function collectAlerts(accounts: Account[]): AlertItem[] {
  const items: AlertItem[] = [];
  for (const account of accounts) {
    for (const alert of account.metrics?.alerts ?? []) items.push({ ...alert, login: account.login, label: account.label });
    if (account.metrics_error) {
      items.push({ level: "yellow", text: `metrics not computed: ${account.metrics_error.slice(0, 60)}`, login: account.login, label: account.label });
    }
  }
  return items.sort((a, b) => levelRank[a.level] - levelRank[b.level] || a.login - b.login);
}

export interface FirmGroup {
  firm: string;
  accounts: Account[];
  equity: number;
  openPl: number;
}

export function groupByFirm(snapshot: Snapshot): FirmGroup[] {
  const firms = [...new Set(snapshot.accounts.map((account) => account.firm))].sort();
  return firms.map((firm) => {
    const accounts = snapshot.accounts.filter((account) => account.firm === firm);
    const readable = accounts.filter(isReadable);
    return {
      firm,
      accounts,
      equity: readable.reduce((sum, account) => sum + (account.equity ?? 0), 0),
      openPl: readable.reduce((sum, account) => sum + openPl(account), 0),
    };
  });
}

export function hasExposure(account: Account) {
  return account.positions.length + account.orders.length > 0;
}
