import { env } from "cloudflare:workers";

import { Container } from "~/components/ui";
import { AurumPage } from "~/features/aurum/aurum-page";
import { AURUM_SCHEMA_VERSION, type AurumSnapshot } from "~/features/aurum/types";
import { pageMeta } from "~/lib/meta";

import type { Route } from "./+types/aurum";

const SNAPSHOT_KEY = "aurum/public";

export function meta() {
  return pageMeta({
    path: "/aurum",
    title: "Aurum Switch · automated gold trading",
    description:
      "Aurum Switch trades gold (XAUUSD) automatically: trend mode on channel breakouts, a limit-order ladder in ranges, a stop loss on every trade. Live account statistics updated every week.",
  });
}

/** Public numbers only: the snapshot holds account-level statistics, never trades or positions. */
export async function loader() {
  const snapshot = await env.TRADING_KV.get<AurumSnapshot>(SNAPSHOT_KEY, "json");
  return { snapshot };
}

export function headers() {
  // Updated weekly: let the edge cache it for an hour.
  return { "Cache-Control": "public, max-age=300, s-maxage=3600" };
}

export default function Aurum({ loaderData: { snapshot } }: Route.ComponentProps) {
  if (!snapshot || snapshot.schema_version !== AURUM_SCHEMA_VERSION) {
    return (
      <Container className="flex flex-col gap-3 py-24">
        <h1 className="m-0 text-3xl font-bold">Aurum Switch</h1>
        <p className="m-0 text-muted">Live statistics are being prepared. Come back on Monday.</p>
      </Container>
    );
  }
  return <AurumPage snapshot={snapshot} />;
}
