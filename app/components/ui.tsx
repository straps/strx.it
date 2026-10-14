import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "./icons";

/** Joins class names, skipping falsy values. */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SHADOW = "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]";

const buttonVariants = {
  primary: `bg-primary text-fg hover:bg-primary-hover hover:text-fg ${SHADOW}`,
  outline: "border border-border bg-transparent text-fg hover:bg-surface-hover hover:text-fg",
} as const;

type ButtonVariant = keyof typeof buttonVariants;

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

/** Anchor styled as a button. `size="md"` keeps the 44px touch target. */
export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return (
    <a
      className={cx(
        "inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors",
        size === "md" ? "min-h-11 px-5" : "px-4 py-2",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Link opening an external site in a new tab. */
export function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

/** Elevated surface used by skill and link cards. */
export const cardClass = cx(
  "rounded-xl border border-border bg-surface p-6 transition-colors",
  SHADOW,
);

/** Square tile holding an icon. */
export function IconTile({ name }: { name: IconName }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-md bg-chip text-link">
      <Icon name={name} size={20} />
    </div>
  );
}

/** Centered page-width container. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto max-w-site px-6", className)}>{children}</div>;
}

/** Monospace uppercase label shown above section titles, e.g. `// skills`. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-accent">
      {"// "}
      {children}
    </span>
  );
}

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
  children: ReactNode;
}

/** Page section with the eyebrow + title header shared by every landing block. */
export function Section({ id, eyebrow, title, intro, className, children }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={cx("border-t border-border", className)}>
      <Container className="flex flex-col gap-8 py-16 md:py-22">
        <SectionHeader eyebrow={eyebrow} title={title} intro={intro} headingId={headingId} />
        {children}
      </Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  headingId,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  headingId?: string;
}) {
  return (
    <div className="flex max-w-160 flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={headingId} className="m-0 text-2xl leading-tight font-bold tracking-[-0.02em] md:text-3xl md:leading-[38px]">
        {title}
      </h2>
      {intro && <p className="m-0 text-base text-muted">{intro}</p>}
    </div>
  );
}
