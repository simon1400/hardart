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

## 007. Focus ring

**Context.** The brief asked for a 2px accent outline. Turquoise on white is about 1.3:1 and invisible on the turquoise hero; WCAG 1.4.11 wants 3:1.

**Decision (Dmytro, 2026-09-13).** `--focus-ring` token: ink on paper and hero, accent inside the ink footer. The accent underline wipe still runs on focus.

**Consequence.** Keyboard focus is visible on every surface.

## 008. Production content guard keys on the deploy, not the branch

**Context.** CLAUDE.md §6 fails `pnpm build` on `main` while placeholders exist, but all work is committed straight to `main` (Dmytro, 2026-09-13), so CI on main would be permanently red.

**Decision.** `scripts/check-content.ts` runs in every build and refuses only when `HARDART_ENV=production`, which `deploy.yml` will set. It checks placeholder projects, people (email, LinkedIn), the company LinkedIn and `{{` in the legal line.

**Consequence.** Placeholders can live on main and on the live site during review only if the deploy sets the variable later; Phase 9 decides when to switch it on.

## 009. Client logos keep Daniel's shared artboard

**Context.** All delivered logos share one 654x368 artboard with the mark placed inside it, which is how Daniel equalised them optically. Files arrived unnamed.

**Decision.** Raw files renamed by client in `logo-partners/` (gitignored). `pnpm logos` copies them to `public/clients/` stripping ids, size and prolog and setting `fill="currentColor"`; geometry is untouched. Creditas is excluded in the script. Every logo renders at one artboard height, `--client-logo-h` (64 to 104px, the marks end up around 20 to 32px as in CLAUDE.md §8.5).

**Consequence.** New logos must use the same artboard, the script warns otherwise.

## 010. Visual baselines are platform specific

**Context.** Font rasterisation differs between Windows and Linux, so one set of screenshots cannot pass on both.

**Decision.** Baselines are captured on the dev machine (`-win32` suffix) with `pnpm test:update-visual`. CI skips `@visual` tests until Linux baselines are committed (Phase 8, generated in CI). The `no-js` project compares against the same baselines, which is the Phase 2 "JS disabled looks identical" check.

**Consequence.** Visual regressions are caught locally, not in CI, until Phase 8.

## 011. Type scale adjustments after seeing the page

**Context.** The §4 defaults were written before the page existed.

**Decision.**

- `--fs-claim`: 12.5vw below md (the widest line "BRAND PEOPLE" fills the width at 12.7vw, five stable lines), `clamp(2.5rem, 6.6vw, 6rem)` from md (the widest line is 13.7em, fills about 90vw). Replaces 5.6vw, which left a visible jump at 820px and a small claim on tablets.
- `--fs-statement`: `clamp(2.25rem, 5vw, 5.5rem)`. The default 7vw made the statement larger than the claim, which contradicts the spec.
- New `--fs-lead` for Who we are ("one large paragraph"), `--row-gap` between work rows, `--fs-list` and `--fs-small`.

**Consequence.** All listed under "To confirm with Dan".

## 012. Visual direction from Daniel's XD mockup

**Context.** On 2026-09-13 Daniel shared an Adobe XD mockup (artboard "Web 1920 – 9"; artboards 1 to 8 are an older concept). It differs from `docs/hardart-web.md` in layout and type. Dmytro: treat it as the direction, not a pixel spec, improve where it helps.

**Decision.** Implemented from the mockup:

- Hero: wordmark top left at 36vw (full width on phones), claim bottom right, right aligned, Mont Bold at 2.6vw (11.5vw on phones, five balanced lines).
- Who we are: accent to paper gradient band below the hero, one flowing paragraph as a centred block, Mont Bold, names highlighted in accent. Copy stays as in the spec (Dmytro).
- Section order: Hero, Who we are, Clients, Work, Statement, What we do, Contact, Footer.
- CLIENTS and SELECTED WORK headings in accent. Client logos run as a CSS marquee (Dmytro approved it although the spec forbids a marquee; reduced motion shows a static wrapped grid).
- Work rows: optional portrait "website scroll" frame (9:16) beside a 16:9 media column with name, text (5em indent) and tags below; sides alternate; rounded corners. Tags are accent outlined pills in Mont (no monospace, Dmytro). Tag sets keep the spec rule; CUSTOM CMS, DEVELOP and APP join the engineering set (Dmytro).
- Statement: one full width line in light grey (`--mute`), two lines on phones.
- Footer: accent wordmark bottom left, tagline uppercase on the right; the three spec columns stay above it.
- Display face is Mont Bold (800) instead of Heavy; Heavy is no longer shipped.
- Corner logo fades in with a CSS scroll timeline until the Phase 4 move replaces it.

**Consequence.** `docs/hardart-web.md` is out of date on hero layout, type weights, section order, colour of headings and the marquee. What we do and Contact are marked "zatím neřeš" in the mockup and keep the spec layout for now.

## 013. Contrast of accent headings and the statement

**Context.** In the mockup the accent section headings on paper measured 1.3:1 and the grey statement 1.45:1, below WCAG 3:1 for large text and the Lighthouse Accessibility 100 budget.

**Decision (Dmytro, 2026-09-13).** Headings are ink on an accent marker stripe (`.section-mark`, the same language as the name highlights). The statement grey is ink at 55 % on paper, above 3:1. The axe test runs without exceptions again.

**Consequence.** The accent stays visible on both headings, contrast rules hold everywhere.

## 014. Project media without dimensions, plain ImageKit URLs

**Context.** Daniel fills projects himself. The XD frames have fixed shapes (16:9 media, 9:16 website frame), and videos are too big for git.

**Decision.**

- `content/projects.ts` names files only (`video`, `poster`, `image`, `site`), relative to a folder per slug. No width or height: frames have fixed aspect ratios and crop with `object-fit: cover`, so CLS stays 0.
- Locally files live in `public/projects/<slug>/` (gitignored). With `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` set, `lib/imagekit.ts` builds ImageKit URLs with transformation presets. Plain URLs instead of `@imagekit/next`: no client bundle cost and nothing it adds is needed in a static export.
- A missing local file renders an empty frame, and `check-content` prints which file is missing.
- `ProjectVideo` attaches the source only near the viewport and pauses off screen (the three video cap stays for Phase 6).
- The website screenshot scrolls inside its frame with a CSS view timeline (transform only, reduced motion rests at the top). Phase 5 may move it to GSAP if Safari or Firefox support falls short.
- Guide for content updates: `docs/content.md`.

**Consequence.** Deploying real media needs the ImageKit endpoint secret (Phase 9) and the same folder tree uploaded to ImageKit.

## 015. Raw media script and self scrolling screenshots

**Context.** Project media arrived as `projects/<slug>.mp4` and very large full page PNGs (up to 12 MB, 11 000 px tall). Dmytro wants the screenshots to scroll slowly by themselves, like a browser window, not follow the page scroll.

**Decision.** `pnpm media` (sharp, dev dependency) copies videos and converts screenshots to 1000 px wide WebP into `public/projects/<slug>/`. The screenshot runs a CSS loop (down, rest, back up), transform only, paused off screen by an IntersectionObserver and still under reduced motion. Duration comes from the image ratio at build, so every site moves at the same speed (0.08 frame widths per second, 20 to 90 s). Posters became optional. The spec rule "only one looping animation" is lifted: Dmytro, 2026-09-13, the site will have many different animations (performance and reduced motion rules still apply).

**Consequence.** Delivered projects are in `content/projects.ts` as `draft` with guessed names and placeholder text and tags; production builds refuse drafts. Visual tests mask project media.

---

## To confirm with Dan

- Label weight: Mont Book (500) at 12px with .12em tracking. Regular (600) is the alternative if labels read too light.
- Mobile layout of every section (the XD only has desktop). Claim on phones: five balanced lines at 11.5vw.
- What we do and Contact are not designed in the XD yet.
- Clients marquee order (roughly by recognisability) and where the "household names" line goes (under the marquee for now).
- 404 copy is a proposal, not in the spec: "Nothing here." / "Back to hardart".
- Favicon and apple icon use the "h" of the wordmark on turquoise.
- Corner logo fades in by scroll; it still overlaps content and is invisible over the footer until the Phase 4 move and colour flip.

## Open items

Tracked from `CLAUDE.md` §17.

- Archia web license (Dmytro/Daniel). Not blocking, the site is built with Mont only until decided.
- RTR Projects: name read from the logo, confirm the spelling. All 18 clients, Creditas included, approved for display by Dmytro on 2026-09-13.
- Project content: names, urls, tags and texts for the 9 delivered projects (all `draft`); confirm names Enevjuran, Kersnerova, Shuffle King, Barbitch; video ratios vary (two square, two ultra wide) and are cropped to 16:9.
- Company LinkedIn URL for the footer "LinkedIn." link (personal emails and LinkedIn delivered 2026-09-13). If there is no company page, decide what the link points to.
- ImageKit account and URL endpoint for production media.
- Favicon: "h" or the full wordmark (Daniel).
- Type scale confirmation on the live site (Daniel).
- Feature flag decisions (Daniel, after Phase 7).
- `docs/hardart-web.md` §4.03 spells the name `DIMITRO`; the site uses `DMYTRO`. Dmytro sends a corrected spec.
