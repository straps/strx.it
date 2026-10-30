/** Public snapshot published to KV `aurum/public` by ~/.hermes/scripts/aurum_macro/aurum_public.py. */
export const AURUM_SCHEMA_VERSION = 1;

export interface MonthReturn {
  month: string; // YYYY-MM
  pct: number;
}

export interface CurvePoint {
  date: string; // YYYY-MM-DD
  pct: number; // growth since start, deposits excluded
}

export interface LiveStats {
  growth_pct: number;
  max_drawdown_pct: number;
  current_drawdown_pct: number;
  days_live: number;
  months: MonthReturn[];
  curve: CurvePoint[];
  currency: string;
  updated: string;
}

export type RegimeMode = "trend_long" | "trend_short" | "range" | null;

export interface AurumSnapshot {
  schema_version: number;
  generated: string;
  name: string;
  instrument: string;
  platform: string;
  broker: string;
  ea_version: string;
  live_since: string;
  signal_url: string;
  live: LiveStats | null;
  regime: { mode: RegimeMode; detector: string | null } | null;
  backtest: {
    period: string;
    start_balance_usd: number;
    final_balance_usd: number;
    growth_pct: number;
    max_drawdown_pct: number;
    cagr_pct: number;
    years: { year: number; pct: number; partial?: boolean }[];
    tester: string;
  };
}
