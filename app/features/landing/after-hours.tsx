import { Section } from "~/components/ui";

import { afterHours } from "./content";

export function AfterHours() {
  return (
    <Section id="after-hours" eyebrow={afterHours.eyebrow} title={afterHours.title} className="bg-surface">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
        {afterHours.items.map((item) => (
          <article key={item.title} className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-6 md:p-8">
            <h3 className="m-0 text-xl font-semibold">{item.title}</h3>
            <p className="m-0 text-base text-muted">{item.text}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
