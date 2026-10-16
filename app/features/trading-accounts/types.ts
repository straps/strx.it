/** Shape of the snapshot that the local MT5 collector publishes to Workers KV. Schema version 1. */
export const SNAPSHOT_SCHEMA_VERSION = 1;

export type Level = "green" | "yellow" | "red" | "breach" | "na";

export interface Position {
  id: string;
  symbol: string;
  side: string;
  volume: number;
  open_price: number;
  current_price: number | null;
  sl: number | null;
  tp: number | null;
  sl_money: number | null;
  tp_money: number | null;
  rr: number | string | null;
  profit: number;
  swap: number;
  opened_at: string;
  comment: string;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  type: string;
  volume: number;
  price: number;
  sl: number | null;
  tp: number | null;
  sl_money: number | null;
  tp_money: number | null;
  rr: number | string | null;
  expires_at: string | null;
  comment: string;
}

export interface Alert {
  level: Level;
  text: string;
}

export interface Closed {
  pnl: number;
  trades: number;
}

export interface Metrics {
  daily: {
    amount: number;
    floor: number;
    room: number;
    used: number;
    level: Level;
    hard: boolean;
    reset: string | null;
    approx: string | null;
    start: number;
  } | null;
  risk: { total: number; missing_sl: string[]; unknown: number; amount: number | null; soft: number | null; level: Level };
  trading_days: { done: number; need: number } | null;
  profitable_days: { done: number; need: number; min_amount: number } | null;
  consistency: {
    best: number;
    total: number;
    pct: number;
    ok: boolean;
    share: number | null;
    needed_total: number | null;
    effect: string;
  } | null;
  inactivity: { days: number; limit: number; left: number; level: Level } | null;
  deadline: { date: string; left: number } | null;
  target: { amount: number; left: number } | null;
  payout: {
    split: number;
    frequency: string | null;
    eval: boolean;
    profit?: number;
    threshold?: number;
    ready?: boolean;
    yours?: number;
  } | null;
  algo: { expected: boolean | null; actual: boolean | null; mismatch: boolean };
  executor: { name: string | null; type: string | null; state: string | null; expected: boolean | null; down: boolean } | null;
  crons: Array<{ id: string; name: string; expected: boolean; actual: boolean; missing: boolean; mismatch: boolean }>;
  phase: string | null;
  to_verify: string[];
  closed: { today: Closed; yesterday: Closed; week: Closed };
  alerts: Alert[];
}

export interface Account {
  id: string;
  label: string;
  status: string;
  firm: string;
  broker: string;
  login: number;
  currency: string;
  program: string | null;
  phase: string | null;
  size: number;
  initial_balance: number;
  start_date: string | null;
  mode: string | null;
  trade_policy: string | null;
  rules: {
    max_loss: { amount: number; type: string; basis: string; initial_floor: number } | null;
    profit_target: { amount: number; pct: number } | null;
  };
  /** `ok`, or why the terminal could not be read (disconnected from the broker, unreachable...). */
  state: string;
  server_time: string | null;
  balance: number | null;
  equity: number | null;
  profit: number | null;
  margin: number | null;
  margin_free: number | null;
  max_loss_floor: number | null;
  max_loss_room: number | null;
  max_loss_trailing: boolean;
  positions: Position[];
  orders: PendingOrder[];
  metrics: Metrics | null;
  metrics_error: string | null;
}

export interface Snapshot {
  schema_version: number;
  generated_at: string;
  refresh_seconds: number;
  totals: {
    accounts: number;
    reachable: number;
    disconnected: number;
    unreachable: number;
    equity: number;
    initial: number;
    open_pl: number;
    closed_today: number;
    positions: number;
    orders: number;
    alerts_red: number;
    alerts_yellow: number;
  };
  accounts: Account[];
}
