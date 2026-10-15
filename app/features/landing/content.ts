import type { IconName } from "~/components/icons";
import type { SocialId } from "~/lib/site";

/** Landing page copy, kept apart from markup so it can be edited in one place. */

export interface TerminalLine {
  command: string;
  output: string[];
}

export const hero = {
  badge: "Strx.it's me",
  title: "Project leader and full-stack developer, AI-native.",
  intro:
    "I lead projects from first idea to production and write the code myself. AI sits at the core of how I work: agents in the loop for planning, coding, review and docs, so small teams ship like big ones.",
  terminal: [
    { command: "whoami", output: ["strx"] },
    { command: "cat roles.txt", output: ["project-leader", "full-stack-developer", "ai-native-builder"] },
    { command: 'claude -p "how do you work?"', output: ["plan → build → review → ship", "humans decide, agents accelerate"] },
  ],
};

/** Shown in random order, three per round, after the opening session has played once. Keep outputs to 2 lines. */
export const demoCommands: TerminalLine[] = [
  { command: 'claude -p "review my last commit"', output: ["no secrets, no TODOs left", "ship it ✅"] },
  { command: 'claude -p "what ships next?"', output: ["scope → roadmap → priorities", "clients always know where things stand"] },
  { command: "ls ~/agents", output: ["ticket-bot  report-writer", "onboarding-guide  mcp-servers/"] },
  { command: 'psql -c "select count(*) from ideas"', output: ["∞"] },
  { command: "curl -sI https://strx.it | head -1", output: ["HTTP/2 200"] },
  { command: "docker ps", output: ["no containers: this site is a Worker ☁️"] },
  { command: "ls ~/music | shuf -n1", output: ["Raise it High"] },
  { command: "play --mute", output: ["muted by default, unmute at the bottom ↓"] },
  { command: "sudo make me a sandwich", output: ["strx is not in the sudoers file.", "This incident will be reported."] },
  { command: "git log --oneline -2", output: ["c09da48 Terminal loop and player seek", "e140815 Player links on mobile"] },
  { command: "fortune", output: ["Ship small, ship often.", "Let the agents carry the boxes."] },
];

export interface Skill {
  icon: IconName;
  title: string;
  text: string;
}

export const skills = {
  eyebrow: "skills",
  title: "I lead the project, build the product and put AI to work on both.",
  items: [
    {
      icon: "listChecks",
      title: "Project leadership",
      text: "From kickoff to go-live: scope, roadmap and priorities. A team that knows what ships next and clients who always know where things stand.",
    },
    {
      icon: "sparkles",
      title: "AI-native development",
      text: "AI in every step of the cycle: Claude Code and agents for coding, refactoring, reviews, tests and documentation, with a human owning every decision.",
    },
    {
      icon: "bot",
      title: "AI tooling for teams",
      text: "Custom agents, skills, plugins and MCP integrations that encode how a team works: tickets, reports, onboarding, docs. Less busywork, more shipping.",
    },
    {
      icon: "code",
      title: "Full-stack TypeScript",
      text: "React front ends, Node.js APIs and services, typed end to end and written to be maintained by someone else.",
    },
    {
      icon: "database",
      title: "PostgreSQL & data",
      text: "Schema design, query tuning and data-heavy business systems that stay fast as they grow.",
    },
    {
      icon: "cloud",
      title: "Linux & cloud",
      text: "Ubuntu as a daily driver, containers, serverless on Cloudflare. Deployments I can automate, monitor and debug over SSH.",
    },
  ] satisfies Skill[],
};

export const stack = {
  eyebrow: "stack",
  title: "Tools I reach for every day.",
  items: [
    "Claude Code",
    "MCP",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Tailwind CSS",
    "Cloudflare",
    "Docker",
    "Ubuntu LTS",
  ],
};

export const afterHours = {
  eyebrow: "after_hours",
  title: "Off the clock, same mindset: build systems, measure, iterate.",
  items: [
    {
      title: "Trading",
      text: "Rules-based trading on funded and live accounts, with an MT5 expert advisor of my own. The same discipline as project work: a plan, a risk limit and a review after every cycle.",
    },
    {
      title: "Music",
      text: "Afro tech with an ethnic, esoteric edge, produced with AI tools and released on YouTube and SoundCloud. AI as an instrument, not a shortcut.",
    },
  ],
};

export const links = {
  eyebrow: "links",
  title: "Let's talk.",
  intro: "Have a project in mind, or want to bring AI into how your team works? Reach out.",
  items: [
    { social: "telegram", icon: "send" },
    { social: "linkedin", icon: "linkedin" },
    { social: "soundcloud", icon: "audioLines" },
    { social: "youtube", icon: "youtube" },
  ] satisfies Array<{ social: SocialId; icon: IconName }>,
};
