import { AfterHours } from "~/features/landing/after-hours";
import { Hero } from "~/features/landing/hero";
import { Links } from "~/features/landing/links";
import { Skills } from "~/features/landing/skills";
import { Stack } from "~/features/landing/stack";
import { pageMeta } from "~/lib/meta";

export function meta() {
  return pageMeta({ path: "/" });
}

export default function Home() {
  return (
    <>
      <Hero />
      <Skills />
      <Stack />
      <AfterHours />
      <Links />
    </>
  );
}
