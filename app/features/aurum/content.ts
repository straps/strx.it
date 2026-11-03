import type { IconName } from "~/components/icons";

/** Copy of the /aurum page, kept apart from markup. Numbers come from the KV snapshot, not from here. */
export const aurum = {
  badge: "Live signal · gold since 30 Oct 2026 · forex since 3 Nov 2026",
  title: "Aurum Switch",
  tagline: "An automated gold strategy that knows when the market trends and when it ranges, balanced by a forex mean-reversion engine.",
  intro:
    "Aurum reads the gold market regime from a 140-day channel on the daily chart, follows breakouts in trend mode and works a small ladder of limit orders when gold moves sideways. Since version 1.40 the same EA also trades six forex crosses with a mean-reversion engine that tends to earn when gold struggles. Every position has a stop loss from the moment it opens.",

  how: {
    eyebrow: "how it works",
    title: "One market, two modes, hard stops",
    items: [
      {
        icon: "trendingUp" as IconName,
        title: "Trend mode",
        text: "When gold breaks out near the top or bottom of its 140-day channel, Aurum enters in the breakout direction at fixed times of the day, with an initial stop of 0.6% that tightens every hour.",
      },
      {
        icon: "listChecks" as IconName,
        title: "Range mode",
        text: "Inside the central part of the channel it places a small ladder of limit orders in the direction of the daily trend, centred on the previous day's pivot, with a common stop and a 5-day time exit.",
      },
      {
        icon: "sparkles" as IconName,
        title: "Regime filter",
        text: "A daily ADX and Efficiency Ratio filter moves the thresholds by a few points when a trend or a range is forming, and trend entries wait when the spread is above normal.",
      },
      {
        icon: "shield" as IconName,
        title: "Risk first",
        text: "Size scales with the account. New trades stop at -25% from the equity peak and everything closes at -30%. No martingale, no averaging down, no hedging tricks.",
      },
    ],
  },

  forex: {
    eyebrow: "forex engine · v1.40",
    title: "Six crosses that pull back to their mean",
    intro:
      "Gold is a trending market, so Aurum earns in waves. To smooth the waves, the same EA runs a second engine on six forex crosses that tend to move in a range: it buys a pair when it is unusually far below its recent average and sells it when it is unusually far above, then exits when the price is back to normal.",
    rules: [
      {
        icon: "listChecks" as IconName,
        title: "Entry",
        text: "Once a day, on the closed daily bar: z-score of the close against its 20 or 50-day average. Beyond ±1.5 to ±2.5 standard deviations (per pair) Aurum opens against the move at the next day open.",
      },
      {
        icon: "arrowRight" as IconName,
        title: "Exit",
        text: "When the z-score is back near zero, or after 5 to 20 days at the latest. A safety stop sits 2 to 10 daily ATRs away from the entry from the first second.",
      },
      {
        icon: "shield" as IconName,
        title: "Risk",
        text: "2.5% of the capital at risk per trade, one trade per pair, a cap on total exposure, and the same drawdown protection as gold: -25% from the peak blocks new trades of both engines, -30% closes everything.",
      },
      {
        icon: "sparkles" as IconName,
        title: "Why not crypto",
        text: "An ETH trend engine is built in but switched off: on this broker the ETH spread is about 40 dollars, and with that cost the trend loses in the tester. It will be switched on only if crypto costs drop.",
      },
    ],
    pairs: ["GBPCAD", "AUDCAD", "EURCAD", "EURGBP", "CHFJPY", "NZDJPY"],
    stats: [
      { label: "forex 2019-2026, per year", value: "+11.5%", tone: "gain" },
      { label: "forex max drawdown", value: "6.3%", tone: "" },
      { label: "with double spreads, per year", value: "+11.0%", tone: "gain" },
      { label: "gold + forex max drawdown", value: "9.6% vs 12.5%", tone: "" },
    ],
    note:
      "MetaTrader 4 Strategy Tester on TopFX symbols, 20,000 EUR, January 2019 to October 2026, simple (not compounded) returns. Only 2022 was slightly negative (-0.4%). The gold + forex drawdown compares gold alone with gold plus forex on the common July 2022 to October 2026 window. Simulated results, not live.",
  },

  live: {
    eyebrow: "live account",
    title: "Real money, real broker",
    intro: "A TopFX account on MetaTrader 4, updated three times a day (8:00, 14:00 and 20:00 CET). Growth excludes deposits and withdrawals, like MQL5 signals.",
  },

  backtest: {
    eyebrow: "backtest",
    title: "Eight years of gold history",
    intro:
      "Simulated on XAUUSD with real spread, commission and swap, starting from 5,000 USD with 0.02 lots per 5,000 USD. Backtests are hypothetical: they show how the rules behaved, not what will happen.",
    note: "2025 and 2026 benefit from an exceptional gold trend; quiet years are much flatter.",
  },

  cta: {
    eyebrow: "follow",
    title: "Copy the signal or just watch it",
    text: "The account is public on MQL5: you can follow it live and subscribe from MetaTrader (gold and the six forex crosses are copied together). For questions, write me on Telegram.",
    signalLabel: "Open the MQL5 signal",
    telegramLabel: "Ask on Telegram",
  },

  disclaimer:
    "Trading leveraged products such as gold and forex CFDs carries a high level of risk and may not be suitable for everyone: you can lose more than you expect. Past performance, live or simulated, does not guarantee future results. Nothing on this page is investment advice.",

  modes: {
    trend_long: { label: "Trend · long", text: "Gold is near the top of its channel: Aurum follows the move up." },
    trend_short: { label: "Trend · short", text: "Gold is near the bottom of its channel: Aurum follows the move down." },
    range: { label: "Range", text: "Gold is inside its channel: Aurum works the limit-order ladder." },
  },
};
