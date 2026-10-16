import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

/**
 * Add new sections inside the layout so they share header and footer, e.g.
 *   route("music", "routes/music.tsx")
 * and list static ones in `prerender` (react-router.config.ts).
 * Private pages (no site chrome, no music player) live outside the layout.
 */
export default [
  layout("routes/site-layout.tsx", [index("routes/home.tsx")]),
  route("trading-accounts", "routes/trading-accounts.tsx"),
] satisfies RouteConfig;
