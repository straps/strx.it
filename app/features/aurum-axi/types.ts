/** Snapshot published to KV `aurum-axi/latest` by ~/.hermes/scripts/aurum_lib/axi_dashboard/axi_publish.py. */
export const AURUM_AXI_SCHEMA_VERSION = 1;

export interface AxiYear {
  year: number;
  starts: number;
  target: number;
  stop: number;
  median_days: number | null;
}

export interface AxiRun {
  tag: string;
  title: string;
  deposit: number;
  rules: string;
  starts: number;
  finished: number;
  running: number;
  first: string | null;
  last: string | null;
  target: number;
  stop: number;
  target_pct: number | null;
  stop_pct: number | null;
  days_p25: number | null;
  days_median: number | null;
  days_p75: number | null;
  days_p90: number | null;
  worst_equity_dd_pct: number;
  years: AxiYear[];
}

export interface Percentiles {
  p10: number;
  median: number;
  p90: number;
}

export interface ProjectionYear {
  year: number;
  own: Percentiles;
  fund: Percentiles;
  earned: Percentiles;
  stage: Record<string, number>;
}

export interface AxiProjection {
  source: string;
  historical_starts?: number;
  first_start?: string;
  last_start?: string;
  own0?: number;
  years?: ProjectionYear[];
}

export type LogStatus = "done" | "running" | "planned" | "failed";

export interface LogEntry {
  date: string;
  status: LogStatus;
  title: string;
  summary: string;
  details?: string[];
}

export interface AxiSnapshot {
  schema_version: number;
  generated: string;
  runs: AxiRun[];
  projection: AxiProjection;
  log: LogEntry[];
}
