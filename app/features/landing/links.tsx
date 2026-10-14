import { Icon } from "~/components/icons";
import { ExternalLink, IconTile, Section, cardClass, cx } from "~/components/ui";
import { socials } from "~/lib/site";

import { links } from "./content";

export function Links() {
  return (
    <Section id="links" eyebrow={links.eyebrow} title={links.title} intro={links.intro}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-6">
        {links.items.map(({ social, icon }) => {
          const { label, href, caption } = socials[social];
          return (
            <ExternalLink
              key={social}
              href={href}
              className={cx(cardClass, "flex flex-col gap-4 text-fg hover:border-primary-hover hover:text-fg")}
            >
              <div className="flex items-center justify-between">
                <IconTile name={icon} />
                <Icon name="arrowUpRight" size={18} className="text-subtle" />
              </div>
              <div className="flex flex-col gap-1 font-mono">
                <span className="text-[17px] leading-7 font-semibold">{label}</span>
                <span className="text-[13px] leading-5 text-muted">{caption}</span>
              </div>
            </ExternalLink>
          );
        })}
      </div>
    </Section>
  );
}
