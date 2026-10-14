# strx.it

Personal website of Francesco "Strx" Strappini — project manager and full-stack developer.

Built with **React 19 + TypeScript** on **React Router v8 (framework mode)**, styled with **Tailwind CSS v4**, and deployed serverless on **Cloudflare Workers**.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | React 19, TypeScript (strict) | Typed components end to end |
| Framework | React Router v8, framework mode | File-based route modules, SSR, build-time pre-rendering |
| Styling | Tailwind CSS v4 (`@theme` tokens) | Design tokens in one CSS file, no runtime cost |
| Fonts | Inter + JetBrains Mono via Fontsource | Self-hosted: no third-party requests, GDPR-friendly |
| Runtime | Cloudflare Workers + Static Assets | Serverless at the edge, free tier is plenty |
| Build | Vite 8 + `@cloudflare/vite-plugin` | Dev server runs inside `workerd`, same as production |

### Rendering model

- Pages listed in `prerender` (`react-router.config.ts`) are rendered **at build time** and served as static HTML from Cloudflare's edge — the landing page costs zero Worker CPU.
- Everything else is **server-rendered by the Worker** (`workers/app.ts`), so future sections can use `loader`/`action` and Cloudflare bindings (KV, D1, R2…).

## Getting started

Requirements: Node.js 22+, npm.

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server with HMR, running in the Workers runtime |
| `npm run build` | Production build + pre-rendering into `build/` |
| `npm run preview` | Build, then serve the production output locally |
| `npm run typecheck` | Generate Worker + route types, then run `tsc` |
| `npm run deploy` | Build and deploy to Cloudflare with Wrangler |

## Project structure

```
app/
├── root.tsx                 # HTML shell, global error boundary
├── app.css                  # Tailwind import + design tokens (@theme)
├── routes.ts                # Route config
├── routes/
│   ├── site-layout.tsx      # Shared header + footer for every section
│   └── home.tsx             # Landing page
├── features/landing/        # Landing sections + their copy (content.ts)
├── components/
│   ├── ui.tsx               # Primitives: Container, Section, ButtonLink, …
│   ├── icons.tsx            # Inline stroke icons
│   └── layout/              # SiteHeader, SiteFooter
└── lib/
    ├── site.ts              # Site identity, contacts, social links, nav
    └── meta.ts              # SEO / Open Graph helper
workers/app.ts               # Cloudflare Worker entry
wrangler.jsonc               # Worker configuration
```

## Adding a section

1. Create `app/routes/<section>.tsx` with a default component and `meta` (use `pageMeta`).
2. Register it inside the layout in `app/routes.ts`: `route("<section>", "routes/<section>.tsx")`.
3. If it is static, add its path to `prerender` in `react-router.config.ts`.
4. Put bigger UI pieces in `app/features/<section>/`.

## Deploy

Production runs on **Cloudflare Workers Builds**, connected to this GitHub repository:

- `main` is the development branch.
- `deploy` is the production branch: every push to `deploy` builds and publishes [strx.it](https://strx.it) automatically.

```bash
git checkout deploy && git merge --ff-only main && git push && git checkout main
```

Workers Builds settings (Cloudflare dashboard → Workers & Pages → `strx-it` → Settings → Build):

| Setting | Value |
| --- | --- |
| Production branch | `deploy` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch builds | disabled (or `npx wrangler versions upload` for preview URLs) |

Manual deploy from a local machine is still possible with `npx wrangler login` once, then `npm run deploy`.
Custom domains (`strx.it`, `www.strx.it`) are declared in `wrangler.jsonc`.

## License

Code is released under the MIT License. Text content and personal information © Francesco Strappini.
