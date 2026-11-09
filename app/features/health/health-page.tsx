import { Container, cardClass, cx } from "~/components/ui";

import type { BodyPoint, HealthDay, HealthSnapshot } from "./types";

const sum = (days: HealthDay[], pick: (d: HealthDay) => number) => days.reduce((total, d) => total + pick(d), 0);
const fmt = (value: number, digits = 0) => value.toLocaleString("en-GB", { maximumFractionDigits: digits, minimumFractionDigits: digits });
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", weekday: "short" });

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "gain" | "loss" }) {
  return (
    <div className={cx(cardClass, "flex flex-col gap-1 p-4")}>
      <span className="text-xs uppercase tracking-wide text-subtle">{label}</span>
      <span className={cx("text-2xl font-semibold", tone === "gain" && "text-gain", tone === "loss" && "text-loss")}>{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

const W = 640;
const H = 180;
const PAD = { top: 14, right: 14, bottom: 22, left: 44 };

/** Line chart as inline SVG (no chart library); needs two points to draw a line. */
function BodyChart({ points, field, unit }: { points: BodyPoint[]; field: "weight_kg" | "waist_cm"; unit: string }) {
  const data = points.flatMap((p) => (p[field] == null ? [] : [{ day: p.day, v: p[field] as number }]));
  if (data.length === 0) return null;
  const values = data.map((d) => d.v);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const x = (i: number) => PAD.left + (data.length === 1 ? 0.5 : i / (data.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.v).toFixed(1)}`).join("");
  const last = data[data.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full text-accent" role="img" aria-label={`${field} trend, last ${last.v} ${unit}`}>
      {[max, min].map((v) => (
        <text key={v} x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="fill-muted font-mono text-[11px]">
          {fmt(v, 1)}
        </text>
      ))}
      {data.length > 1 && <path d={line} fill="none" stroke="currentColor" strokeWidth={2} />}
      {data.map((d, i) => (
        <circle key={d.day} cx={x(i)} cy={y(d.v)} r={3.5} fill="currentColor" />
      ))}
      <text x={x(data.length - 1)} y={y(last.v) - 9} textAnchor="end" className="fill-fg font-mono text-[11px]">
        {fmt(last.v, 1)} {unit}
      </text>
      {data.length > 1 && (
        <text x={PAD.left} y={H - 4} className="fill-subtle font-mono text-[11px]">
          {shortDay(data[0].day)}
        </text>
      )}
      <text x={W - PAD.right} y={H - 4} textAnchor="end" className="fill-subtle font-mono text-[11px]">
        {shortDay(last.day)}
      </text>
    </svg>
  );
}

export function HealthPage({ snapshot }: { snapshot: HealthSnapshot }) {
  const { days, body, goal } = snapshot;
  const last7 = days.slice(-7);
  const last14 = days.slice(-14).reverse();
  const weights = body.filter((b) => b.weight_kg != null);
  const waists = body.filter((b) => b.waist_cm != null);
  const weight = weights.at(-1)?.weight_kg;
  const waist = waists.at(-1)?.waist_cm;
  const active7 = sum(last7, (d) => d.active_min);
  const units7 = sum(last7, (d) => d.alcohol_units);
  const packs7 = sum(last7, (d) => d.packs);
  const goalDays7 = last7.filter((d) => d.active_min >= goal.daily_active_min).length;

  return (
    <Container className="flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 text-3xl font-bold">Health log</h1>
        <p className="m-0 text-sm text-muted">
          Private. Updated {new Date(snapshot.generated).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Rome" })}.
          Goals: {goal.daily_active_min} active minutes a day, {goal.target_weight_kg} kg, at most {goal.max_alcohol_units} alcohol units a day.
        </p>
      </header>

      <section aria-label="Summary" className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <Stat label="Streak" value={`${snapshot.streak_days} d`} hint={`best ${snapshot.best_streak_days} d, ${goal.daily_active_min}+ min a day`} tone={snapshot.streak_days > 0 ? "gain" : undefined} />
        <Stat label="Active, 7 days" value={`${fmt(active7)} min`} hint={`goal hit ${goalDays7}/7 days`} />
        <Stat label="Weight" value={weight == null ? "-" : `${fmt(weight, 1)} kg`} hint={`target ${goal.target_weight_kg}`} />
        <Stat label="Waist" value={waist == null ? "-" : `${fmt(waist)} cm`} hint="target 83-85" />
        <Stat label="Alcohol, 7 days" value={`${fmt(units7, 1)} u`} hint={`limit ${fmt(goal.max_alcohol_units * 7)} u`} tone={units7 > goal.max_alcohol_units * 7 ? "loss" : "gain"} />
        <Stat label="Cigarette packs, 7 days" value={fmt(packs7)} hint={`${fmt(packs7 * snapshot.pack_price_eur, 2)} EUR`} />
      </section>

      <section aria-label="Body" className="grid gap-4 md:grid-cols-2">
        <div className={cx(cardClass, "flex flex-col gap-2 p-4")}>
          <h2 className="m-0 text-base font-semibold">Weight</h2>
          {weights.length ? <BodyChart points={body} field="weight_kg" unit="kg" /> : <p className="m-0 text-sm text-muted">No data yet.</p>}
        </div>
        <div className={cx(cardClass, "flex flex-col gap-2 p-4")}>
          <h2 className="m-0 text-base font-semibold">Waist</h2>
          {waists.length ? <BodyChart points={body} field="waist_cm" unit="cm" /> : <p className="m-0 text-sm text-muted">No data yet.</p>}
        </div>
      </section>

      <section aria-label="Daily log" className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-semibold">Last 14 days</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-subtle">
                <th className="py-2 pr-3 font-medium">Day</th>
                <th className="py-2 pr-3 text-right font-medium">Active min</th>
                <th className="py-2 pr-3 text-right font-medium">Steps</th>
                <th className="py-2 pr-3 text-right font-medium">Sleep h</th>
                <th className="py-2 pr-3 text-right font-medium">Alcohol u</th>
                <th className="py-2 pr-3 text-right font-medium">Packs</th>
                <th className="py-2 text-right font-medium">Meals /10</th>
              </tr>
            </thead>
            <tbody>
              {last14.map((d) => (
                <tr key={d.day} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-mono">{shortDay(d.day)}</td>
                  <td className={cx("py-2 pr-3 text-right", d.active_min >= goal.daily_active_min ? "text-gain" : "text-muted")}>{d.active_min}</td>
                  <td className="py-2 pr-3 text-right">{d.steps == null ? "-" : fmt(d.steps)}</td>
                  <td className="py-2 pr-3 text-right">{d.sleep_h == null ? "-" : fmt(d.sleep_h, 1)}</td>
                  <td className={cx("py-2 pr-3 text-right", d.alcohol_units > goal.max_alcohol_units ? "text-loss" : "")}>{d.alcohol_units ? fmt(d.alcohol_units, 1) : "-"}</td>
                  <td className="py-2 pr-3 text-right">{d.packs || "-"}</td>
                  <td className="py-2 text-right">{d.meal_score == null ? "-" : fmt(d.meal_score, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
