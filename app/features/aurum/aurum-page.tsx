import { Icon } from "~/components/icons";
import { ButtonLink, Container, ExternalLink, Section, cardClass, cx } from "~/components/ui";
import { socials } from "~/lib/site";

import { aurum } from "./content";
import { EquityChart } from "./equity-chart";
import type { AurumSnapshot, MonthReturn } from "./types";

const pct = (v: number, digits = 1) => `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
const tone = (v: number) => (v > 0 ? "text-gain" : v < 0 ? "text-loss" : "text-muted");
const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-bg p-5">
      <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</span>
      <span className={cx("font-mono text-2xl font-bold", className)}>{value}</span>
    </div>
  );
}

function Hero({ snapshot }: { snapshot: AurumSnapshot }) {
  const live = snapshot.live;
  const mode = snapshot.regime?.mode ? aurum.modes[snapshot.regime.mode] : null;
  return (
    <section aria-labelledby="aurum-title" className="relative">
      <div aria-hidden="true" className="hero-glow absolute inset-x-0 -top-24 bottom-0 -z-10" />
      <Container className="flex flex-wrap items-center gap-12 pt-16 pb-16 md:pt-24 md:pb-22">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
          <span className="inline-flex items-center gap-2 self-start rounded-md bg-chip px-3.5 py-1.5 font-mono text-sm font-semibold text-link">
            <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-gain" />
            {aurum.badge}
          </span>
          <h1 id="aurum-title" className="m-0 text-4xl leading-tight font-bold tracking-[-0.03em] md:text-[52px] md:leading-[60px]">
            {aurum.title}
            <span className="block text-accent">{snapshot.instrument}</span>
          </h1>
          <p className="m-0 max-w-140 text-xl text-fg">{aurum.tagline}</p>
          <p className="m-0 max-w-140 text-base text-muted">{aurum.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={snapshot.signal_url} target="_blank" rel="noopener noreferrer">
              {aurum.cta.signalLabel}
              <Icon name="arrowUpRight" />
            </ButtonLink>
            <ButtonLink href="#live" variant="outline">
              See the numbers
            </ButtonLink>
            <ButtonLink href="/aurum/accounts" variant="outline">
              Every account
            </ButtonLink>
          </div>
        </div>

        <div className={cx(cardClass, "flex min-w-0 flex-[1_1_360px] flex-col gap-4")}>
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">live growth</span>
          <span className={cx("font-mono text-5xl font-bold", tone(live?.growth_pct ?? 0))}>
            {live ? pct(live.growth_pct, 2) : "—"}
          </span>
          <div className="grid grid-cols-2 gap-3 font-mono text-sm">
            <div className="flex flex-col">
              <span className="text-muted">max drawdown</span>
              <span>{live ? `${live.max_drawdown_pct.toFixed(1)}%` : "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted">days live</span>
              <span>{live ? live.days_live : 0}</span>
            </div>
          </div>
          {mode && (
            <div className="rounded-lg bg-bg p-3">
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-accent">now · {mode.label}</span>
              <p className="m-0 mt-1 text-sm text-muted">{mode.text}</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function MonthGrid({ months }: { months: MonthReturn[] }) {
  if (!months.length) return null;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
      {months.map((m) => (
        <div key={m.month} className="flex flex-col gap-1 rounded-lg border border-border bg-bg px-3 py-2">
          <span className="font-mono text-xs text-muted">{monthLabel(m.month)}</span>
          <span className={cx("font-mono text-base font-semibold", tone(m.pct))}>{pct(m.pct)}</span>
        </div>
      ))}
    </div>
  );
}

export function AurumPage({ snapshot }: { snapshot: AurumSnapshot }) {
  const live = snapshot.live;
  const bt = snapshot.backtest;
  const maxYear = Math.max(...bt.years.map((y) => Math.abs(y.pct)));

  return (
    <>
      <Hero snapshot={snapshot} />

      <Section id="live" eyebrow={aurum.live.eyebrow} title={aurum.live.title} intro={aurum.live.intro} className="bg-surface">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-4">
          <Stat label="growth" value={live ? pct(live.growth_pct, 2) : "—"} className={tone(live?.growth_pct ?? 0)} />
          <Stat label="max drawdown" value={live ? `${live.max_drawdown_pct.toFixed(1)}%` : "—"} />
          <Stat label="from peak now" value={live ? `${live.current_drawdown_pct.toFixed(1)}%` : "—"} />
          <Stat label="live since" value={dateLabel(snapshot.live_since)} className="text-xl" />
        </div>
        <div className="rounded-xl border border-border bg-bg p-4 md:p-6">
          <EquityChart points={live?.curve ?? []} />
        </div>
        <MonthGrid months={live?.months ?? []} />
        <p className="m-0 font-mono text-xs text-muted">
          {snapshot.broker} · {snapshot.platform} · {snapshot.instrument} · EA v{snapshot.ea_version}
          {live && ` · data to ${dateLabel(live.updated)}`}
        </p>
        <a href="/aurum/accounts" className="inline-flex items-center gap-2 self-start font-mono text-sm text-link no-underline hover:underline">
          Aurum also runs on prop-firm accounts: see every account
          <Icon name="arrowUpRight" />
        </a>
      </Section>

      <Section id="how" eyebrow={aurum.how.eyebrow} title={aurum.how.title}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-6">
          {aurum.how.items.map((item) => (
            <article key={item.title} className={cx(cardClass, "flex flex-col gap-3")}>
              <div className="flex size-10 items-center justify-center rounded-md bg-chip text-link">
                <Icon name={item.icon} size={20} />
              </div>
              <h3 className="m-0 text-lg font-semibold">{item.title}</h3>
              <p className="m-0 text-sm text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="backtest" eyebrow={aurum.backtest.eyebrow} title={aurum.backtest.title} intro={aurum.backtest.intro} className="bg-surface">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-4">
          <Stat label={bt.period} value={pct(bt.growth_pct, 0)} className="text-gain" />
          <Stat label="per year (cagr)" value={pct(bt.cagr_pct)} className="text-gain" />
          <Stat label="max drawdown" value={`${bt.max_drawdown_pct}%`} />
          <Stat
            label="5,000 usd became"
            value={`${bt.final_balance_usd.toLocaleString("en-US")} $`}
            className="text-xl"
          />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-4 md:p-6">
          {bt.years.map((y) => (
            <div key={y.year} className="grid grid-cols-[5rem_1fr_4.5rem] items-center gap-3 font-mono text-sm">
              <span className="text-muted">
                {y.year}
                {y.partial && "*"}
              </span>
              <div className="h-2.5 rounded-full bg-surface">
                <div
                  className={cx("h-full rounded-full", y.pct >= 0 ? "bg-gain" : "bg-loss")}
                  style={{ width: `${Math.max(2, (Math.abs(y.pct) / maxYear) * 100)}%` }}
                />
              </div>
              <span className={cx("text-right", tone(y.pct))}>{pct(y.pct)}</span>
            </div>
          ))}
          <p className="m-0 pt-2 text-xs text-muted">* to October. {aurum.backtest.note}</p>
        </div>
        <p className="m-0 text-sm text-muted">{bt.tester}</p>
      </Section>

      <Section id="follow" eyebrow={aurum.cta.eyebrow} title={aurum.cta.title} intro={aurum.cta.text}>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={snapshot.signal_url} target="_blank" rel="noopener noreferrer">
            {aurum.cta.signalLabel}
            <Icon name="arrowUpRight" />
          </ButtonLink>
          <ButtonLink href={socials.telegram.href} target="_blank" rel="noopener noreferrer" variant="outline">
            <Icon name="send" />
            {aurum.cta.telegramLabel}
          </ButtonLink>
        </div>
        <p className="m-0 max-w-200 border-t border-border pt-6 text-xs text-muted">
          {aurum.disclaimer}{" "}
          <ExternalLink href={snapshot.signal_url}>Full statistics on MQL5.</ExternalLink>
        </p>
      </Section>
    </>
  );
}
