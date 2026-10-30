import type { CurvePoint } from "./types";

const W = 640;
const H = 200;
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };

const fmtPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

/** Growth curve as inline SVG (no chart library): area + line, zero baseline, first/last labels. */
export function EquityChart({ points }: { points: CurvePoint[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-50 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
        The curve appears after the first full week of live trading.
      </div>
    );
  }
  const values = points.map((p) => p.pct);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const x = (i: number) => PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - min) / span) * (H - PAD.top - PAD.bottom);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.pct).toFixed(1)}`).join("");
  const area = `${line}L${x(points.length - 1).toFixed(1)},${y(0).toFixed(1)}L${x(0).toFixed(1)},${y(0).toFixed(1)}Z`;
  const last = values[values.length - 1];
  const tone = last >= 0 ? "text-gain" : "text-loss";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`h-auto w-full ${tone}`} role="img" aria-label={`Growth since start: ${fmtPct(last)}`}>
      <defs>
        <linearGradient id="aurum-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} className="stroke-border" strokeDasharray="4 4" />
      {[max, min].filter((v, i, a) => a.indexOf(v) === i).map((v) => (
        <text key={v} x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="fill-muted font-mono text-[11px]">
          {fmtPct(v)}
        </text>
      ))}
      <path d={area} fill="url(#aurum-area)" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(points.length - 1)} cy={y(last)} r={4} fill="currentColor" />
      <text x={PAD.left} y={H - 6} className="fill-muted font-mono text-[11px]">
        {points[0].date}
      </text>
      <text x={W - PAD.right} y={H - 6} textAnchor="end" className="fill-muted font-mono text-[11px]">
        {points[points.length - 1].date}
      </text>
    </svg>
  );
}
