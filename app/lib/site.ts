/** Site-wide configuration: identity, contacts and social profiles. */
export const site = {
  name: "strx.it",
  url: "https://strx.it",
  title: "Strx · Project leader and AI-native full-stack developer",
  description:
    "Francesco \"Strx\" Strappini: project leader and full-stack developer with AI at the core of how he works. TypeScript, React, Node.js, PostgreSQL, Claude Code and agents.",
  email: "fstraps@gmail.com",
  /** Social share card, 1200x630. Regenerate with `node scripts/og/generate.mjs`. */
  ogImage: { path: "/og.png", width: 1200, height: 630, alt: "strx.it: project leader and AI-native full-stack developer" },
} as const;

export type SocialId = "telegram" | "linkedin" | "github" | "soundcloud" | "youtube";

export interface SocialLink {
  id: SocialId;
  label: string;
  href: string;
  caption: string;
}

export const socials: Record<SocialId, SocialLink> = {
  telegram: {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/fstraps",
    caption: "t.me/fstraps",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/fstraps",
    caption: "linkedin.com/in/fstraps",
  },
  github: {
    id: "github",
    label: "GitHub",
    href: "https://github.com/straps",
    caption: "github.com/straps",
  },
  soundcloud: {
    id: "soundcloud",
    label: "SoundCloud",
    href: "https://soundcloud.com/strx-musix",
    caption: "soundcloud.com/strx-musix",
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@strx-music",
    caption: "The music channel · @strx-music",
  },
};

/** Primary navigation. Absolute hashes so links work from any section of the site. */
export const navItems = [
  { label: "skills", href: "/#skills" },
  { label: "stack", href: "/#stack" },
  { label: "after_hours", href: "/#after-hours" },
  { label: "links", href: "/#links" },
] as const;
