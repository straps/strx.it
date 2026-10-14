import { site, socials } from "~/lib/site";

import { Container, ExternalLink } from "../ui";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-bg">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-6 font-mono text-xs text-muted">
        <span>
          © {year} {site.name} · Strx is how friends and colleagues call me
        </span>
        <ExternalLink href={socials.linkedin.href}>{socials.linkedin.caption}</ExternalLink>
      </Container>
    </footer>
  );
}
