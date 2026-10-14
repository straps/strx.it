/** Site-wide configuration: identity, contacts and social profiles. */
export const site = {
  name: "strx.it",
  url: "https://strx.it",
  title: "Strx · Project manager and full-stack developer",
  description:
    "Francesco \"Strx\" Strappini: project manager and full-stack developer. TypeScript, React, Node.js and PostgreSQL on Linux. Off the clock: trading and music.",
  email: "fstraps@gmail.com",
} as const;

export type SocialId = "telegram" | "linkedin" | "soundcloud" | "youtube";

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
