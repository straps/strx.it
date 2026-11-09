/** Private snapshot published to KV `health/latest` by ~/.hermes/scripts/health/health_publish.mjs. */
export const HEALTH_SCHEMA_VERSION = 1;

export interface HealthDay {
  day: string; // YYYY-MM-DD
  active_min: number;
  steps: number | null;
  sleep_h: number | null;
  packs: number;
  alcohol_units: number;
  meal_score: number | null; // average 1-10, null when no meal logged
}

export interface BodyPoint {
  day: string;
  weight_kg: number | null;
  waist_cm: number | null;
}

export interface HealthSnapshot {
  schema_version: number;
  generated: string; // ISO timestamp
  goal: { daily_active_min: number; target_weight_kg: string; max_alcohol_units: number };
  streak_days: number;
  best_streak_days: number;
  pack_price_eur: number;
  days: HealthDay[]; // oldest first
  body: BodyPoint[]; // oldest first
}
