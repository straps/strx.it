import type { IconName } from "~/components/icons";
import type { SocialId } from "~/lib/site";

/** Landing page copy, kept apart from markup so it can be edited in one place. */

export const hero = {
  badge: "Strx.it's me",
  title: "Project manager and full-stack developer.",
  intro:
    "I run delivery and write the code: TypeScript, React, Node.js and PostgreSQL on Linux. Off the clock I trade the markets and produce music.",
  terminal: [
    { command: "whoami", output: ["strx"] },
    { command: "cat roles.txt", output: ["project-manager", "full-stack-developer"] },
    { command: 'psql -c "select * from interests"', output: ["trading | music | linux | tech"] },
  ],
};

export interface Skill {
  icon: IconName;
  title: string;
  text: string;
}

export const skills = {
  eyebrow: "skills",
  title: "One person who can plan it, build it and keep it running.",
  items: [
    {
      icon: "listChecks",
      title: "Project management",
      text: "Scope, plan and deliver. Clear milestones, honest estimates and a team that always knows what ships next.",
    },
    {
      icon: "code",
      title: "Full-stack development",
      text: "TypeScript end to end: React front ends, Node.js services and APIs written to be maintained by someone else.",
    },
    {
      icon: "terminal",
      title: "Linux",
      text: "Ubuntu LTS as a daily driver. Servers, shell automation and deployments I can debug over SSH.",
    },
    {
      icon: "database",
      title: "PostgreSQL",
      text: "Schema design, query tuning and stored procedures for data-heavy business systems.",
    },
    {
      icon: "trendingUp",
      title: "Trading",
      text: "A rules-first approach to the markets: defined risk, tested logic and automation with MT5 expert advisors.",
    },
    {
      icon: "music",
      title: "Music creation",
      text: "AI-assisted tracks in an afro tech, ethnic and esoteric style, released on my own channel.",
    },
  ] satisfies Skill[],
};

export const stack = {
  eyebrow: "stack",
  title: "Tools I reach for every day.",
  items: ["TypeScript", "React", "Node.js", "PostgreSQL", "Ubuntu LTS", "Bash", "MetaTrader 5"],
};

export const afterHours = {
  eyebrow: "after_hours",
  title: "Two disciplines, one habit: build systems and refine them.",
  items: [
    {
      title: "Trading",
      text: "Funded accounts, a live account and an expert advisor of my own for MT5. The same discipline as project work: a plan, a risk limit and a review after every cycle.",
    },
    {
      title: "Music",
      text: "Afro tech with an ethnic, esoteric edge, made with AI tools and published on YouTube. Part experiment, part creative outlet.",
    },
  ],
};

export const links = {
  eyebrow: "links",
  title: "Find me online.",
  intro: "Talk to me, follow the work, or listen to the music.",
  items: [
    { social: "telegram", icon: "send" },
    { social: "linkedin", icon: "linkedin" },
    { social: "soundcloud", icon: "audioLines" },
    { social: "youtube", icon: "youtube" },
  ] satisfies Array<{ social: SocialId; icon: IconName }>,
};
