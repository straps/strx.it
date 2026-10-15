import { Icon } from "~/components/icons";
import { ExternalLink, IconTile, Section, cardClass, cx } from "~/components/ui";
import { socials } from "~/lib/site";

import { links } from "./content";

const COLUMNS_PER_ROW = 3;
/** Span (in a 6-column grid) of the cards in a last, incomplete row, so they stretch instead of leaving a gap. */
const lastRowSpan = { 1: "lg:col-span-6", 2: "lg:col-span-3" } as const;

/** Column span of the card at `index`: full rows of three, then a last row that fills the width. */
function spanClass(index: number, total: number) {
  const remainder = total % COLUMNS_PER_ROW;
  return remainder && index >= total - remainder
    ? lastRowSpan[remainder as keyof typeof lastRowSpan]
    : "lg:col-span-2";
}

export function Links() {
  return (
    <Section id="links" eyebrow={links.eyebrow} title={links.title} intro={links.intro}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {links.items.map(({ social, icon }, index) => {
          const { label, href, caption } = socials[social];
          return (
            <ExternalLink
              key={social}
              href={href}
              className={cx(
                cardClass,
                "flex flex-col gap-4 text-fg hover:border-primary-hover hover:text-fg",
                spanClass(index, links.items.length),
              )}
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
