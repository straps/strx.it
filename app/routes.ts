import { type RouteConfig, index, layout } from "@react-router/dev/routes";

/**
 * Add new sections inside the layout so they share header and footer, e.g.
 *   route("music", "routes/music.tsx")
 * and list static ones in `prerender` (react-router.config.ts).
 */
export default [
  layout("routes/site-layout.tsx", [index("routes/home.tsx")]),
] satisfies RouteConfig;
