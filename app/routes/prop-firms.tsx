import { useEffect, useRef } from "react";

import { Container } from "~/components/ui";
import content from "~/features/prop-firms/content.html?raw";
import { initComparisonTable } from "~/features/prop-firms/comparison-table";
import { pageMeta } from "~/lib/meta";

import "~/features/prop-firms/prop-firms.css";

export function meta() {
  return pageMeta({
    path: "/prop-firms/",
    title: "Prop firm comparison under $200",
    description:
      "Prop firm challenges under $200 compared on steps, drawdown type, EA policy, news rules and real checkout prices with discount codes. Static snapshot, November 2026.",
  });
}

/**
 * Static snapshot written by hand: the long copy lives in content.html (trusted, in the repo),
 * the table rows in rows.ts. Prerendered at build time, the table is wired on the client.
 */
export default function PropFirms() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? initComparisonTable(ref.current) : undefined), []);
  return (
    <Container className="py-12 md:py-16">
      <div ref={ref} className="pf" dangerouslySetInnerHTML={{ __html: content }} />
    </Container>
  );
}
