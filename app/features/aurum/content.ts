import type { IconName } from "~/components/icons";

/** Copy of the /trading page, kept apart from markup. Numbers come from the KV snapshot, not from here. */
export const aurum = {
  badge: "Live signal · IC Markets · since 3 Nov 2026",
  title: "Aurum Switch",
  tagline: "An automated gold strategy that knows when the market trends and when it ranges, balanced by a forex mean-reversion engine.",
  intro:
    "Aurum reads the gold market regime from a 140-day channel on the daily chart, follows breakouts in trend mode and works a small ladder of limit orders when gold moves sideways. The same EA also trades six forex crosses with a mean-reversion engine that tends to earn when gold struggles, and an ETH trend engine. Every position has a stop loss from the moment it opens.",

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
        text: "Size scales with the account: 0.01 gold lots per 5,000 USD of balance. One protection for all engines: at -30% from the equity peak everything closes and the EA stops. No martingale, no averaging down, no hedging tricks.",
      },
    ],
  },

  forex: {
    eyebrow: "forex engine",
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
        text: "2.5% of the capital at risk per trade, one trade per pair, a cap on total exposure, and the same drawdown protection as gold: -30% from the peak closes every engine.",
      },
      {
        icon: "sparkles" as IconName,
        title: "ETH trend",
        text: "A third engine follows ETH breakouts of a 55-day channel with a 10-day exit, 6% of the capital at risk. It trades rarely and earns in the big crypto trends; on IC Markets the ETH spread is low enough for it to pay.",
      },
    ],
    pairs: ["GBPCAD", "AUDCAD", "EURCAD", "EURGBP", "CHFJPY", "NZDJPY"],
    stats: [
      { label: "forex 2019-2026, total", value: "+2,736 $", tone: "gain" },
      { label: "forex positive months", value: "68 of 95", tone: "" },
      { label: "forex worst month", value: "-109 $", tone: "" },
      { label: "all engines, positive months", value: "70 of 95", tone: "gain" },
    ],
    note:
      "MetaTrader 5 Strategy Tester on IC Markets, the live EA v1.06, each calendar year starting again from 2,600 USD, January 2019 to November 2026. Totals by engine: gold +8,758 $, forex +2,736 $, ETH +2,424 $. Simulated results, not live.",
  },

  live: {
    eyebrow: "live account",
    title: "Real money, real broker",
    intro: "An IC Markets account on MetaTrader 5, started with 2,600 USD, updated three times a day (8:00, 14:00 and 20:00 CET). Growth excludes deposits and withdrawals, like MQL5 signals.",
  },

  backtest: {
    eyebrow: "backtest",
    title: "Eight years, year by year",
    intro:
      "The live EA in the MetaTrader 5 Strategy Tester on IC Markets prices, with real spread, commission and swap. Each calendar year starts again from 2,600 USD, so every bar is the result of that year alone, not compounded. Backtests are hypothetical: they show how the rules behaved, not what will happen.",
    note: "2025 and 2026 benefit from an exceptional gold trend; quiet years are much flatter.",
  },

  certificates: {
    eyebrow: "certificates",
    title: "Recognised by the prop firms",
    intro:
      "Prop firms award a certificate when a trader completes an evaluation. This one comes from FundedNext, for a Stellar 2-Step challenge.",
    image: "/trading/fundednext-elite-trader-certificate.webp",
    alt: "FundedNext Certificate of Appreciation presented to Francesco Strappini, officially a FundedNext Elite Trader, Stellar 2-Step Challenge P1 6K, issued on 20 November 2026.",
    caption: "FundedNext Elite Trader · Stellar 2-Step Challenge P1 · 6K · issued 20 Nov 2026",
    linkLabel: "FundedNext",
    linkHref: "https://fundednext.com/",
  },

  cta: {
    eyebrow: "follow",
    title: "Copy the signal or just watch it",
    text: "The account is public on MQL5: you can follow it live and subscribe from MetaTrader (gold, the six forex crosses and ETH are copied together). For questions, write me on Telegram.",
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
