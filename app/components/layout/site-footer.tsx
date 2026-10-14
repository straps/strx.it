import { site } from "~/lib/site";

import { Container } from "../ui";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-bg">
      <Container className="py-6 font-mono text-xs text-muted">
        © {year} {site.name}
      </Container>
    </footer>
  );
}
