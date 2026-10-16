import { env } from "cloudflare:workers";

import { SiteHeader } from "~/components/layout/site-header";
import { Dashboard } from "~/features/trading-accounts/dashboard";
import { SNAPSHOT_SCHEMA_VERSION, type Snapshot } from "~/features/trading-accounts/types";
import { requireAccess } from "~/lib/access.server";

import type { Route } from "./+types/trading-accounts";

const SNAPSHOT_KEY = "trading-accounts/latest";

export function meta() {
  return [{ title: "Trading accounts" }, { name: "robots", content: "noindex, nofollow" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAccess(request);
  const snapshot = await env.TRADING_KV.get<Snapshot>(SNAPSHOT_KEY, "json");
  return { snapshot };
}

function Notice({ title, children }: { title: string; children: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-site flex-col justify-center gap-3 px-6 py-16">
      <h1 className="m-0 text-2xl font-semibold">{title}</h1>
      <p className="m-0 text-muted">{children}</p>
    </main>
  );
}

export default function TradingAccounts({ loaderData: { snapshot } }: Route.ComponentProps) {
  if (!snapshot) return <Notice title="No data yet">The collector has not published a snapshot.</Notice>;
  if (snapshot.schema_version !== SNAPSHOT_SCHEMA_VERSION) {
    return <Notice title="Unsupported data version">{`The snapshot uses schema ${snapshot.schema_version}, this page reads schema ${SNAPSHOT_SCHEMA_VERSION}.`}</Notice>;
  }
  return (
    <>
      <SiteHeader opaque />
      <main>
        <Dashboard snapshot={snapshot} />
      </main>
    </>
  );
}
