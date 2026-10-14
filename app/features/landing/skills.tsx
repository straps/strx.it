import { IconTile, Section, cardClass, cx } from "~/components/ui";

import { skills } from "./content";

export function Skills() {
  return (
    <Section id="skills" eyebrow={skills.eyebrow} title={skills.title}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
        {skills.items.map((skill) => (
          <article key={skill.title} className={cx(cardClass, "flex flex-col gap-3 hover:border-primary-hover")}>
            <IconTile name={skill.icon} />
            <h3 className="m-0 text-[17px] leading-7 font-semibold">{skill.title}</h3>
            <p className="m-0 text-sm leading-[22px] text-muted">{skill.text}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
