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
- `app/features/player/`: fixed bottom music player (random order, no autoplay: nothing is downloaded until the visitor presses play, next or picks a track in the modal list, newest release first). Tracks live in `tracks.json` + `public/music/`, both generated from the local library (`~/mega/suno`) by `node scripts/sync-music.mjs`: rerun it to add a track, never edit them by hand.
- `app/lib/site.ts`: identity, email, social links, nav items. Single place to change a URL.
- `app/lib/meta.ts`: `pageMeta({ path, title?, description? })` for every route's `meta` export (title, description, canonical, Open Graph).
- Path alias `~/*` → `app/*`.

### Adding a section

1. `app/routes/<name>.tsx` exporting `meta` (via `pageMeta`) and a default component.
2. Register `route("<name>", "routes/<name>.tsx")` inside the layout in `app/routes.ts`.
3. Static content → add `"/<name>"` to `prerender`.
4. Needs data/bindings → add a `loader`, declare bindings in `wrangler.jsonc`, run `npm run cf-typegen`, read them via `import { env } from "cloudflare:workers"`.
5. Add a nav entry in `navItems` if it belongs in the header. Nav hrefs are absolute (`/#skills`) so they work from any page.

### /aurum (public)

- Public page for the Aurum Switch gold signal (`app/features/aurum/`, `app/routes/aurum.tsx`), SSR with a 1-hour edge cache.
- Reads KV `aurum/public` (same `TRADING_KV` namespace as /trading-accounts). Account-level statistics only: growth without deposits, drawdown, monthly returns, equity curve, current regime, backtest summary. Never trades or positions.
- Published every Monday 08:30 by `~/.hermes/scripts/aurum_macro/aurum_public.py` (Hermes cron), from the EA equity journal (one row per hour while gold trades).
- `/aurum/accounts`: status of every account running an Aurum EA (own account and prop evaluations), from KV `aurum/accounts`, published every Monday 08:30 by `~/.hermes/scripts/aurum_macro/aurum_accounts.py` (same cron). Masked logins, account-level numbers only (balance, result since Aurum took over, target progress, loss-limit room, weekly history), never trades or positions.

## Conventions

- Code, identifiers, comments, commits in English. Commit format: `"strx.it, Topic, exhaustive description"`. No Co-Authored-By.
- Styling: Tailwind utilities with the semantic tokens (`bg-bg`, `bg-surface`, `border-border`, `text-fg`, `text-muted`, `text-subtle`, `text-accent`, `text-link`, `bg-chip`, `bg-primary`…). Never hardcode hex colors in components; add a token to `@theme` instead.
- Layout container width is `max-w-site` (1120px) with `px-6` gutters, via `Container`.
- Accessibility: real `<a>`/`<button>`, `aria-hidden` on decorative SVG, `aria-labelledby` on sections, touch targets ≥ 44px (`ButtonLink` size `md`), visible `:focus-visible`.
- External links: use `ExternalLink` (adds `target="_blank" rel="noopener noreferrer"`).
- Keep pages working at phone width (flex-wrap / `auto-fit` grids, no fixed widths).
- No unnecessary dependencies: this is a static-first site, keep the client bundle small.

## Deploy

- Branches: `main` = development, `deploy` = production. Cloudflare **Workers Builds** watches `deploy`: every push there runs `npm run build` + `npx wrangler deploy` and updates https://strx.it. Pushes to other branches (e.g. `main`) only produce preview builds (`npx wrangler preview`); build status: Cloudflare dashboard → strx-it → Deployments / Builds.
- Release: `git checkout deploy && git merge --ff-only main && git push && git checkout main`. Pushing to `deploy` is a production release: ask before doing it.
- It is a Worker (SSR + static assets), not a Cloudflare Pages project: do not migrate to Pages.
- Worker name: `strx-it`. Custom domains `strx.it` and `www.strx.it` are declared in `wrangler.jsonc` (`routes` with `custom_domain: true`), so every deploy keeps them. Fallback URL: https://strx-it.fstraps.workers.dev (`workers_dev: true`); `preview_urls: true` gives per-version preview URLs.
- Generated files not to commit: `build/`, `.react-router/`, `.wrangler/`, `worker-configuration.d.ts` (already gitignored).
- Secrets: `.dev.vars` locally (gitignored), `wrangler secret put` or dashboard variables in production.

## Analytics

- Cloudflare Web Analytics (cookieless, no consent banner): beacon script in `app/root.tsx`, production builds only. The site token in `app/lib/site.ts` is public by design. No custom events; if they are ever needed, GoatCounter was the alternative considered.

## Cloudflare access

- Deploy and API credentials live in the gitignored `.env`; Wrangler loads it by itself (no `wrangler login` needed). Never copy credential values into committed files, docs or logs.
- Account details, tooling paths and API recipes are in the private, gitignored file imported below (absent in public clones):

@INFRA.local.md

## Domain and DNS

- DNS for `strx.it` is delegated to Cloudflare (full setup); registrar details are in `INFRA.local.md`.
- Zone settings: "Always Use HTTPS" on (HTTP → 301 to HTTPS); edge certificate issued by Cloudflare (covers `strx.it` and `*.strx.it`).
- DNS records for the apex and `www` are created automatically by the Worker custom domains: do not add A/CNAME records for them by hand.
- The domain sends no email: `TXT strx.it "v=spf1 -all"` and `TXT _dmarc "v=DMARC1; p=reject; adkim=s; aspf=s"` block spoofing. If email is ever added, update both.
- Check delegation: `dig +short NS strx.it` (authoritative: `dig NS strx.it @a.dns.it +norec`).
