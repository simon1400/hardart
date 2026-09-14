# hardart.cz

One page studio site for hardart (Daniel and Dmytro). Static export of Next.js 16, served by Nginx.

- Design and copy: `docs/hardart-web.md` and `docs/hardart-projects.md` (Daniel)
- Engineering brief: `CLAUDE.md`, decisions: `docs/decisions.md`
- Adding projects and client logos in detail: `docs/content.md`

## Setup

Requirements: Node 24 (`.nvmrc`) and pnpm through corepack.

```sh
corepack enable
pnpm install
cp .env.example .env.local   # fill in the values you need, see below
pnpm dev                     # http://localhost:3000
```

`.env.local` is never committed.

| Variable                            | Needed for                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | project media from ImageKit; empty serves `public/projects/` from the build      |
| `IMAGEKIT_PRIVATE_KEY`              | `pnpm media:upload` only, on the machine that uploads; never on the server       |
| `NEXT_PUBLIC_UMAMI_HOST`            | Umami analytics origin, production builds only (together with the id)            |
| `NEXT_PUBLIC_UMAMI_ID`              | Umami website id                                                                 |
| `HARDART_FLAGS`                     | build time: `all` or comma separated flag names turn feature flags on locally    |
| `HARDART_ENV=production`            | build time, set by the deploy: refuses placeholders and drafts (`check-content`) |

## Commands

| Command                                            | What it does                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev`                                         | development server (includes the dev only page `/dev/work-30`)                              |
| `pnpm build`                                       | copy and content checks, `next build` into `out/`, then the CSP meta tag (`scripts/csp.ts`) |
| `pnpm start`                                       | serves `out/`                                                                               |
| `pnpm lint`, `pnpm typecheck`, `pnpm format:check` | code checks                                                                                 |
| `pnpm test`                                        | copy check and all Playwright tests against `out/` (run `pnpm build` first)                 |
| `pnpm test:update-visual`                          | re-renders the win32 visual baselines (commit them as `visual: …`)                          |
| `pnpm check-budget`                                | JS on the page, gzip, against the 300 KiB ceiling (after a build)                           |
| `pnpm lighthouse`                                  | Lighthouse CI, mobile, three runs, budgets from `lighthouserc.json` (after a build)         |
| `pnpm media`                                       | turns raw project deliveries in `projects/` into web files in `public/projects/`            |
| `pnpm media:upload`                                | uploads new or changed media files to ImageKit                                              |
| `pnpm logos`                                       | cleans client logos from `logo-partners/` into `public/clients/`                            |
| `pnpm fonts`                                       | converts the Mont OTF sources into the woff2 files in `app/fonts/` (run once)               |

Before every commit: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`.

## Daniel's deliveries

Daniel sends files through Telegram (Dmytro's `Downloads/Telegram Desktop/`).

**Project copy** (`hardart-projects.md`): copy it to `docs/hardart-projects.md`, then update the entries in `content/projects.ts` word for word. Tags must exist in `TAGS` at the top of that file.

**Project media** (videos, full page screenshots):

1. Put them into `projects/` as `<slug>.mp4` and `<slug>.png` (the folder is gitignored).
2. `pnpm media` transcodes the video, picks a poster and resizes the screenshot.
3. `pnpm media:upload` sends the files to ImageKit.
4. Add or update the entry in `content/projects.ts`.

**Client logos**: SVGs on the shared 654×368 artboard into `logo-partners/<name>.svg`, then `pnpm logos` and an entry in `content/clients.ts`.

Everything about sizes, file names and the checks the build runs is in `docs/content.md`.

## Feature flags

Extras beyond the design (`heroGrain`, `mediaHover`, `cursor`) are off. Turn one on for the live site with `featureDefaults.<name> = true` in `lib/features.ts`; try them locally with `HARDART_FLAGS=all pnpm build`. A disabled flag ships zero bytes.

## Tests and CI

`.github/workflows/ci.yml` runs on every push and pull request: lint, typecheck, formatting, copy check, build, JS budget, Playwright (smoke, motion, reduced motion, email, security, accessibility, visual), Lighthouse CI, and a second build with all feature flags on. CI builds without project media, so frames render empty there.

Visual baselines are platform specific. Windows baselines come from `pnpm test:update-visual`; Linux baselines, which CI compares against, are rendered by the manual workflow `.github/workflows/visual-baselines.yml`:

```sh
gh workflow run visual-baselines.yml
gh run download <run id> -n visual-baselines -D tests/__screenshots__
```

## Security headers and CSP

Every exported HTML file carries a `<meta>` Content Security Policy that allows inline scripts only by hash; `scripts/csp.ts` writes it after `next build` from `lib/security.ts`. Nginx adds the header policy and the other security headers from `nginx/hardart-headers.conf`, and `tests/security.spec.ts` keeps both in sync and runs the page under them. A new third party host (media, analytics) goes into `lib/security.ts` and the Nginx snippet together.

## Deploy

Nginx serves `out/` from `/var/www/hardart.cz` with the reference config in `nginx/` (applied by hand). The GitHub Actions deploy is Phase 9 (`docs/sessions.md`).
