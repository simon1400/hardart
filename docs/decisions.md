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

---

## To confirm with Dan

_Nothing yet._

## Open items

Tracked from `CLAUDE.md` §17.

- Archia web license (Dmytro/Daniel).
- Client logo SVGs, optically equalised, and per client permission to show them. No Creditas.
- Project content: name, url, media, tags, text per project (Daniel).
- LinkedIn URLs for both (Daniel, Dmytro).
- Daniel's legal identification for the footer line, or the decision to show only Dmytro's.
- Favicon: "h" or the full wordmark (Daniel).
- Type scale confirmation on the live site (Daniel, after Phase 2).
- Feature flag decisions (Daniel, after Phase 7).
- Source files not yet in the repo: Mont OTF files, Archia files, wordmark SVG. Needed for Phase 1.
- `docs/hardart-web.md` §4.03 spells the name `DIMITRO`; per `CLAUDE.md` §0 this is a typo and the site uses `DMYTRO`. Confirm with Daniel so the spec gets fixed too.
