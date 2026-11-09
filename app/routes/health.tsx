import { env } from "cloudflare:workers";

import { HealthPage } from "~/features/health/health-page";
import { HEALTH_SCHEMA_VERSION, type HealthSnapshot } from "~/features/health/types";
import { requireHealthKey } from "~/lib/health-key.server";

import type { Route } from "./+types/health";

const SNAPSHOT_KEY = "health/latest";

export function meta() {
  return [{ title: "Health log" }, { name: "robots", content: "noindex, nofollow" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  requireHealthKey(request);
  const snapshot = await env.TRADING_KV.get<HealthSnapshot>(SNAPSHOT_KEY, "json");
  return { snapshot };
}

export default function Health({ loaderData: { snapshot } }: Route.ComponentProps) {
  if (!snapshot || snapshot.schema_version !== HEALTH_SCHEMA_VERSION) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-site flex-col justify-center gap-3 px-6 py-16">
        <h1 className="m-0 text-2xl font-semibold">No data yet</h1>
        <p className="m-0 text-muted">The publisher has not uploaded a snapshot.</p>
      </main>
    );
  }
  return (
    <main>
      <HealthPage snapshot={snapshot} />
    </main>
  );
}
