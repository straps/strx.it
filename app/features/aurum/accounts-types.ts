/** Snapshot of every account running an Aurum EA, published to KV `aurum/accounts` three times a day (8, 14, 20)
 * by ~/.hermes/scripts/aurum_macro/aurum_accounts.py. Account-level numbers only. */
export const AURUM_ACCOUNTS_SCHEMA_VERSION = 1;

export type AccountStatus = "running" | "starting" | "target reached" | "limit breached" | "closed" | "no data";

export interface AccountPoint {
  date: string; // YYYY-MM-DD (Monday of the update)
  pnl_pct: number;
}

export interface AurumAccount {
  key: string;
  login: string; // masked, e.g. •••850
  firm: string;
  program: string;
  platform: string;
  ea: string;
  variant: string;
  since: string | null;
  status: AccountStatus;
  kind: "own" | "prop";
  currency: string;
  balance?: number | null;
  equity?: number | null;
  pnl?: number | null;
  pnl_pct?: number | null;
  target?: number | null;
  target_progress_pct?: number | null;
  /** Page order (Francesco 03/11/2026): 0 own, 1 funded, 2 last step before funding, 3 first step of a 2-step. */
  stage_rank?: number;
  /** Public copy-trading pages (account-info.json copy_trading, active only): MQL5 signal and other platforms. */
  copy?: { platform: string; url: string; label: string }[];
  target_pct?: number | null;
  target_note?: string;
  initial?: number | null;
  loss_floor?: number | null;
  loss_room?: number | null;
  loss_room_pct?: number | null;
  max_dd_pct?: number | null;
  dd_now_pct?: number | null;
  note?: string;
  /** Clause shown under the header of the card (e.g. the account is part of a growth programme). */
  program_note?: string;
  history: AccountPoint[];
}

export interface AurumAccountsSnapshot {
  schema_version: number;
  generated: string;
  data_time: string | null;
  accounts: AurumAccount[];
  summary: { accounts: number; running: number; starting: number; positive: number; targets: number };
}
