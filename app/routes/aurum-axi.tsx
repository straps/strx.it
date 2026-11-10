import { env } from "cloudflare:workers";

import { Container } from "~/components/ui";
import { AxiPage } from "~/features/aurum-axi/axi-page";
import { AURUM_AXI_SCHEMA_VERSION, type AxiSnapshot } from "~/features/aurum-axi/types";

import type { Route } from "./+types/aurum-axi";

const SNAPSHOT_KEY = "aurum-axi/latest";

export function meta() {
  return [{ title: "Aurum on Axi Select" }, { name: "robots", content: "noindex, nofollow" }];
}

/** Account-level backtest statistics only. Published by ~/.hermes/scripts/aurum_lib/axi_dashboard/axi_publish.py. */
export async function loader() {
  const snapshot = await env.TRADING_KV.get<AxiSnapshot>(SNAPSHOT_KEY, "json");
  return { snapshot };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300" };
}

export default function AurumAxi({ loaderData: { snapshot } }: Route.ComponentProps) {
  if (!snapshot || snapshot.schema_version !== AURUM_AXI_SCHEMA_VERSION) {
    return (
      <Container className="flex flex-col gap-3 py-24">
        <h1 className="m-0 text-3xl font-bold">Aurum on Axi Select</h1>
        <p className="m-0 text-muted">The first snapshot has not been published yet.</p>
      </Container>
    );
  }
  return <AxiPage snapshot={snapshot} />;
}
