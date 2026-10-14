import { Icon } from "~/components/icons";
import { ButtonLink, Container } from "~/components/ui";
import { site, socials } from "~/lib/site";

import { hero } from "./content";
import { Terminal } from "./terminal";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title">
      <Container className="flex flex-wrap items-center gap-12 pt-16 pb-16 md:pt-24 md:pb-22">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
          <span className="self-start rounded-md bg-chip px-3.5 py-1.5 font-mono text-base font-semibold text-link">
            {hero.badge}
          </span>
          <h1
            id="hero-title"
            className="m-0 text-4xl leading-tight font-bold tracking-[-0.03em] md:text-[44px] md:leading-[52px]"
          >
            {hero.title}
          </h1>
          <p className="m-0 max-w-140 text-lg text-muted">{hero.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={`mailto:${site.email}`}>
              Start a project
              <Icon name="arrowRight" />
            </ButtonLink>
            <ButtonLink href="#skills" variant="outline">
              See what I do
            </ButtonLink>
            <ButtonLink
              href={socials.linkedin.href}
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="linkedin" />
              LinkedIn
            </ButtonLink>
          </div>
        </div>

        <div className="min-w-0 flex-[1_1_380px]">
          <Terminal />
        </div>
      </Container>
    </section>
  );
}
