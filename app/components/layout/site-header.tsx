import { Link } from "react-router";

import { navItems, site } from "~/lib/site";

import { ButtonLink, Container } from "../ui";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-bg">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-4">
        <Link to="/" className="font-mono text-xl font-bold tracking-[-0.02em] text-fg">
          strx<span className="text-accent">.it</span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="font-mono text-muted hover:text-fg">
              {item.label}
            </a>
          ))}
          <ButtonLink href={`mailto:${site.email}`} size="sm">
            Get in touch
          </ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
