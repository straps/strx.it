import { env } from "cloudflare:workers";

import { Container } from "~/components/ui";
import { AccountsPage } from "~/features/aurum/accounts-page";
import { AURUM_ACCOUNTS_SCHEMA_VERSION, type AurumAccountsSnapshot } from "~/features/aurum/accounts-types";
import { pageMeta } from "~/lib/meta";

import type { Route } from "./+types/aurum-accounts";

const SNAPSHOT_KEY = "aurum/accounts";

export function meta() {
  return pageMeta({
    path: "/aurum/accounts",
    title: "Aurum Switch · every account",
    description:
      "Status of every account running the Aurum gold EAs: own account and prop-firm evaluations, results, targets and loss-limit room, updated every Monday.",
  });
}

/** Account-level numbers only: logins masked, no trades or positions. */
export async function loader() {
  const snapshot = await env.TRADING_KV.get<AurumAccountsSnapshot>(SNAPSHOT_KEY, "json");
  return { snapshot };
}

export function headers() {
  return { "Cache-Control": "public, max-age=300, s-maxage=3600" };
}

export default function AurumAccounts({ loaderData: { snapshot } }: Route.ComponentProps) {
  if (!snapshot || snapshot.schema_version !== AURUM_ACCOUNTS_SCHEMA_VERSION) {
    return (
      <Container className="flex flex-col gap-3 py-24">
        <h1 className="m-0 text-3xl font-bold">Every Aurum account</h1>
        <p className="m-0 text-muted">The first weekly update is on its way. Come back on Monday.</p>
      </Container>
    );
  }
  return <AccountsPage snapshot={snapshot} />;
}
