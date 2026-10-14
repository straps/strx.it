import type { Config } from "@react-router/dev/config";

/**
 * SSR stays enabled so future sections can use loaders/actions on the Worker.
 * Static routes listed in `prerender` are rendered at build time and served as plain assets.
 */
export default {
  ssr: true,
  prerender: ["/"],
} satisfies Config;
