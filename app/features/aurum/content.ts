import type { IconName } from "~/components/icons";

/** Copy of the /aurum page, kept apart from markup. Numbers come from the KV snapshot, not from here. */
export const aurum = {
  badge: "Live gold signal · since 30 Oct 2026",
  title: "Aurum Switch",
  tagline: "An automated gold strategy that knows when the market trends and when it ranges.",
  intro:
    "Aurum trades XAUUSD only. It reads the market regime from a 140-day channel on the daily chart, follows breakouts in trend mode and works a small ladder of limit orders when gold moves sideways. Every position has a stop loss from the moment it opens.",

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

  live: {
    eyebrow: "live account",
    title: "Real money, real broker",
    intro: "A TopFX account on MetaTrader 4, updated every Monday morning. Growth excludes deposits and withdrawals, like MQL5 signals.",
  },

  backtest: {
    eyebrow: "backtest",
    title: "Eight years of history",
    intro:
      "Simulated on XAUUSD with real spread, commission and swap, starting from 5,000 USD with 0.02 lots per 5,000 USD. Backtests are hypothetical: they show how the rules behaved, not what will happen.",
    note: "2025 and 2026 benefit from an exceptional gold trend; quiet years are much flatter.",
  },

  cta: {
    eyebrow: "follow",
    title: "Copy the signal or just watch it",
    text: "The account is public on MQL5: you can follow it live and subscribe from MetaTrader. For questions, write me on Telegram.",
    signalLabel: "Open the MQL5 signal",
    telegramLabel: "Ask on Telegram",
  },

  disclaimer:
    "Trading leveraged products such as gold CFDs carries a high level of risk and may not be suitable for everyone: you can lose more than you expect. Past performance, live or simulated, does not guarantee future results. Nothing on this page is investment advice.",

  modes: {
    trend_long: { label: "Trend · long", text: "Gold is near the top of its channel: Aurum follows the move up." },
    trend_short: { label: "Trend · short", text: "Gold is near the bottom of its channel: Aurum follows the move down." },
    range: { label: "Range", text: "Gold is inside its channel: Aurum works the limit-order ladder." },
  },
};
