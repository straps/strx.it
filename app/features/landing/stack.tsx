import { Container, SectionHeader } from "~/components/ui";

import { stack } from "./content";

export function Stack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="border-t border-border">
      <Container className="flex flex-wrap items-center gap-x-16 gap-y-8 py-16 md:py-22">
        <div className="min-w-0 flex-[1_1_320px]">
          <SectionHeader eyebrow={stack.eyebrow} title={stack.title} headingId="stack-title" />
        </div>
        <ul className="m-0 flex min-w-0 flex-[1_1_460px] list-none flex-wrap gap-3 p-0 font-mono">
          {stack.items.map((tool) => (
            <li key={tool} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium">
              {tool}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
