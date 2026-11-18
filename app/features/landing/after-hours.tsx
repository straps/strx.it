import { Icon, type IconName } from "~/components/icons";
import { ButtonLink, Section } from "~/components/ui";
import { socials, type SocialId } from "~/lib/site";

import { afterHours, type AfterHoursItem } from "./content";

const socialIcons: Record<SocialId, IconName> = {
  telegram: "send",
  linkedin: "linkedin",
  github: "github",
  soundcloud: "audioLines",
  youtube: "youtube",
  instagram: "instagram",
};

function Buttons({ item }: { item: AfterHoursItem }) {
  if (!item.actions?.length && !item.socials?.length) return null;
  return (
    <div className="mt-auto flex flex-wrap gap-3 pt-2">
      {item.actions?.map(({ label, href }) => (
        <ButtonLink key={href} href={href}>
          {label}
          <Icon name="arrowRight" size={16} />
        </ButtonLink>
      ))}
      {item.socials?.map((id) => {
        const { label, href } = socials[id];
        return (
          <ButtonLink key={id} href={href} variant="outline" target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
            <Icon name={socialIcons[id]} size={16} />
            {label}
          </ButtonLink>
        );
      })}
    </div>
  );
}

export function AfterHours() {
  return (
    <Section id="after-hours" eyebrow={afterHours.eyebrow} title={afterHours.title} className="bg-surface">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
        {afterHours.items.map((item: AfterHoursItem) => (
          <article key={item.title} className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-6 md:p-8">
            <h3 className="m-0 text-xl font-semibold">{item.title}</h3>
            <p className="m-0 text-base text-muted">{item.text}</p>
            <Buttons item={item} />
          </article>
        ))}
      </div>
    </Section>
  );
}
