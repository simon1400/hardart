# Decisions

ADR style log. One entry per non-obvious technical decision: context, decision, consequence.

---

## 001. Stack

**Context.** One page static studio site, motion heavy, served by Nginx from a VPS. Full brief in `CLAUDE.md` §2.

**Decision.** Next.js 16 App Router with `output: 'export'`, React 19, TypeScript strict with `noUncheckedIndexedAccess`, Tailwind CSS 4 (CSS-first), pnpm, Node 24 LTS. GSAP 3.15 + Lenis for motion (Phase 3), ImageKit for project media (Phase 6), Playwright and Lighthouse CI for tests (Phase 8).

**Consequence.** No Node process in production, `out/` is the deploy artefact. Anything requiring a server (image optimisation, route handlers at request time) is unavailable by design.

## 002. Tooling versions pinned below latest

**Context.** At scaffold time (2026-09) TypeScript 7.0 and ESLint 10 are the latest releases, but `typescript-eslint` 8.70 supports TypeScript `<6.1` and `eslint-config-next` 16.3 pulls plugins (`eslint-plugin-react`, `-import`, `-jsx-a11y`) that do not declare ESLint 10 support.

**Decision.** TypeScript 6.0.x, ESLint 9.x. Lint config is flat: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` + `typescript-eslint` strict for TS files.

**Consequence.** Upgrade both once `typescript-eslint` and the Next plugins support them; a single `pnpm up` plus a lint run.

## 003. One CSS entry file

**Context.** Tailwind 4 processes each CSS file on its own, so `@theme` only registers when it is in the same file graph as `@import 'tailwindcss'`.

**Decision.** `app/styles/globals.css` imports Tailwind, then `tokens.css`, `base.css`, `utilities.css`. `layout.tsx` imports only `globals.css`. The three files from the layout in `CLAUDE.md` §3 stay as the places where code lives.

**Consequence.** One extra file next to the three planned ones.

## 004. check-copy scope

**Context.** `CLAUDE.md` §3 says `check-copy` scans `content/` and `app/`.

**Decision.** It also scans `components/` and `lib/`, case insensitive for "Dimitro". Copy should never live there, so this only catches mistakes. It runs as part of `pnpm build` and `pnpm test`.

**Consequence.** A stray em dash in a code comment also fails the build. Use commas.

## 005. Fonts: Mont only, two files, converted with Node

**Context.** Archia is not used for now (license unconfirmed). Python is not available on the dev machine, so fonttools is out. Mont's OS/2 weight classes are shifted: Book is 500, Regular 600, Heavy 900. The family has no Medium.

**Decision.** `scripts/fonts.ts` uses `subset-font` (harfbuzz wasm) to produce `mont-book.woff2` and `mont-heavy.woff2` (Latin, Latin-1, Latin Extended-A, punctuation). Book (500) is body and labels, which is the Medium slot of the §5 fallback; Heavy (900) is claim and headings. Label face is its own token `--face-label`, so Archia later is a one line change.

**Consequence.** 85 KB of preloaded font in total. Files live in `app/fonts/`, not `public/fonts/`: `next/font/local` emits hashed copies into `_next/static/media`, so a `public/` copy would be shipped twice.

## 006. Wordmark source and colour

**Context.** The supplied `logo.svg` has a hard coded turquoise fill and a 0.92 group opacity. The brief needs one wordmark that follows `currentColor` (ink in hero and corner, accent over the footer).

**Decision.** `public/brand/hardart.svg` keeps the original seven paths unchanged, with `fill="currentColor"` and no opacity. The original is kept in `docs/brand/hardart-original.svg`. `components/ui/Wordmark.tsx` inlines the repo file at build.

**Consequence.** Ink `#1A1A1A` already equals black at 90 %, so dropping the 0.92 opacity does not change the intended colour.

---

## To confirm with Dan

- Label weight: Mont Book (500) at 12px with .12em tracking. Regular (600) is the alternative if labels read too light.
- `--fs-claim` minimum of 40px leaves the mobile hero mostly empty; the spec wants the claim to fill the screen. Proposal for Phase 2: raise the mobile size (around 13vw) so the three lines own the lower half.

## Open items

Tracked from `CLAUDE.md` §17.

- Archia web license (Dmytro/Daniel). Not blocking, the site is built with Mont only until decided.
- Client logo SVGs, optically equalised, and per client permission to show them. No Creditas.
- Project content: name, url, media, tags, text per project (Daniel).
- LinkedIn URLs for both (Daniel, Dmytro).
- Daniel's legal identification for the footer line, or the decision to show only Dmytro's.
- Favicon: "h" or the full wordmark (Daniel).
- Type scale confirmation on the live site (Daniel, after Phase 2).
- Feature flag decisions (Daniel, after Phase 7).
- Focus ring: the brief asks for a 2px accent outline, but turquoise on white is about 1.3:1 contrast and invisible on the turquoise hero (WCAG 1.4.11 wants 3:1). Proposal: ink outline on paper and hero, accent outline in the footer. Implemented as the brief says until Dmytro decides.
- `docs/hardart-web.md` §4.03 spells the name `DIMITRO`; per `CLAUDE.md` §0 this is a typo and the site uses `DMYTRO`. Confirm with Daniel so the spec gets fixed too.
