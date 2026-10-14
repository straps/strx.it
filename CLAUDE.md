# CLAUDE.md

Guidance for Claude Code (and humans) working on this repository. Public repo: never commit secrets.

## What this is

`strx.it`, the personal site of Francesco "Strx" Strappini. For now a single landing page; the structure is ready for more sections (e.g. music, trading, blog).

The visual source of truth is the Claude Design canvas **"Strx Personal Site"**:
https://claude.ai/artifact/6xmtRJYFxFJKVC317m4Y4G (artboard `Main.dc.html`, Hydra design system).
When the design changes, read the canvas with the Artifact tool and port the diff; do not invent new styles.

## Stack

- React 19 + TypeScript (strict), **React Router v8 in framework mode** (`@react-router/dev`).
- Tailwind CSS v4 via `@tailwindcss/vite`; no `tailwind.config`, tokens live in `app/app.css` under `@theme`.
- Cloudflare Workers via `@cloudflare/vite-plugin` (dev server runs in `workerd`). Config: `wrangler.jsonc`.
- Fonts self-hosted with `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`. Do **not** add Google Fonts links (privacy/GDPR, extra DNS round trip).
- No icon library: icons are inline SVG in `app/components/icons.tsx` (Lucide paths). Add new ones there.

React Router v8 is newer than most training data: before using an API you are not sure about, read the installed docs in `node_modules/react-router/docs/` (see `.agents/skills/react-router/SKILL.md`).

## Commands

```bash
npm run dev         # dev server, http://localhost:5173
npm run typecheck   # wrangler types + react-router typegen + tsc -b  (run before every commit)
npm run build       # production build + prerender into build/
npm run preview     # build + serve production output (http://localhost:4173)
npm run deploy      # manual build + wrangler deploy (normally not needed: push to `deploy` instead)
```

Public preview of a local server: `cloudflared tunnel --url http://localhost:4173` (`.trycloudflare.com` is already in Vite `allowedHosts`).

## Architecture

- `react-router.config.ts`: `ssr: true` + `prerender: [...]`. Static pages go in `prerender` and are served as assets (no Worker invocation); anything else is SSR'd by `workers/app.ts`.
- `app/root.tsx`: HTML shell, favicon, global `ErrorBoundary` (also the 404 page).
- `app/routes.ts`: all routes nest inside `layout("routes/site-layout.tsx", [...])` so they share `SiteHeader`/`SiteFooter`.
- `app/features/<section>/`: section-specific components. Copy lives in `content.ts`, separate from markup.
- `app/components/ui.tsx`: shared primitives (`Container`, `Section`, `SectionHeader`, `Eyebrow`, `ButtonLink`, `ExternalLink`, `IconTile`, `cardClass`, `cx`). Reuse them; extend here instead of duplicating class strings.
- `app/lib/site.ts`: identity, email, social links, nav items. Single place to change a URL.
- `app/lib/meta.ts`: `pageMeta({ path, title?, description? })` for every route's `meta` export (title, description, canonical, Open Graph).
- Path alias `~/*` → `app/*`.

### Adding a section

1. `app/routes/<name>.tsx` exporting `meta` (via `pageMeta`) and a default component.
2. Register `route("<name>", "routes/<name>.tsx")` inside the layout in `app/routes.ts`.
3. Static content → add `"/<name>"` to `prerender`.
4. Needs data/bindings → add a `loader`, declare bindings in `wrangler.jsonc`, run `npm run cf-typegen`, read them via `import { env } from "cloudflare:workers"`.
5. Add a nav entry in `navItems` if it belongs in the header. Nav hrefs are absolute (`/#skills`) so they work from any page.

## Conventions

- Code, identifiers, comments, commits in English. Commit format: `"strx.it, Topic, exhaustive description"`. No Co-Authored-By.
- Styling: Tailwind utilities with the semantic tokens (`bg-bg`, `bg-surface`, `border-border`, `text-fg`, `text-muted`, `text-subtle`, `text-accent`, `text-link`, `bg-chip`, `bg-primary`…). Never hardcode hex colors in components; add a token to `@theme` instead.
- Layout container width is `max-w-site` (1120px) with `px-6` gutters, via `Container`.
- Accessibility: real `<a>`/`<button>`, `aria-hidden` on decorative SVG, `aria-labelledby` on sections, touch targets ≥ 44px (`ButtonLink` size `md`), visible `:focus-visible`.
- External links: use `ExternalLink` (adds `target="_blank" rel="noopener noreferrer"`).
- Keep pages working at phone width (flex-wrap / `auto-fit` grids, no fixed widths).
- No unnecessary dependencies: this is a static-first site, keep the client bundle small.

## Deploy

- Branches: `main` = development, `deploy` = production. Cloudflare **Workers Builds** watches `deploy`: every push there runs `npm run build` + `npx wrangler deploy` and updates https://strx.it.
- Release: `git checkout deploy && git merge --ff-only main && git push && git checkout main`. Pushing to `deploy` is a production release: ask before doing it.
- It is a Worker (SSR + static assets), not a Cloudflare Pages project: do not migrate to Pages.
- Worker name: `strx-it`. The custom domain is attached in the dashboard (Settings → Domains & Routes); alternatively uncomment `routes` in `wrangler.jsonc`.
- Generated files not to commit: `build/`, `.react-router/`, `.wrangler/`, `worker-configuration.d.ts` (already gitignored).
- Secrets: `.dev.vars` locally (gitignored), `wrangler secret put` or dashboard variables in production.
