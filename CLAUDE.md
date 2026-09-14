# HARDART.CZ, engineering brief and build plan

Read this file at the start of every session. It is the engineering source of truth for the hardart.cz website.
The design source of truth is `docs/hardart-web.md` (written by Daniel, the designer). Read both. Project copy for the Work section is `docs/hardart-projects.md` (Daniel).

Rule of precedence:
1. `docs/hardart-web.md` decides **what the site looks like, says and how it moves**. Never change copy, colours, type rules or motion rules on your own.
2. This file decides **how it is built**.
3. If the two conflict, or the design spec is silent on something you need, stop and ask Dmytro. One question is cheaper than a wrong assumption.

Language of communication: Russian or English, whatever Dmytro uses. Code, comments, commits, docs: English. Site copy: English only, exactly as in the spec, never paraphrased.

---

## 0. Who is who

- **Dmytro Pechunka**: owner of this repo, full stack engineer, makes all technical decisions. You work for him.
- **Daniel**: designer, author of `docs/hardart-web.md`. Supplies assets and content (project media, client logos, LinkedIn URLs, tags). He reviews the live site on hardart.cz.
- The site presents both as equal partners. Never introduce copy or structure that favours one of them. Name is spelled **Dmytro** everywhere (an earlier draft had "Dimitro", that was a typo).

---

## 1. What we are building

A one page studio site. No navigation, scroll is the navigation. English only. Static. Typography carries the page, motion is a brand feature, not decoration. Reference quality bar: Apple product pages, loveandmoney.com, twks.ch. Awwwards level execution. Motion has no restrictions beyond performance and reduced motion (Dmytro, 2026-09-13): the goal is wow, so propose and build bold moves, while quality still shows in timing, smoothness, zero layout shift and flawless mobile scroll.

Non goals: CMS, backend, forms, i18n, dark mode (`prefers-color-scheme` is ignored, the palette is fixed), blog, case study subpages (may come later, keep the content model ready for it).

---

## 2. Stack (pinned decisions)

| Concern | Decision | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router), `output: 'export'` | Static HTML/CSS/JS. No Node process in production. Latest 16.x at install time, do not use canary. |
| Runtime | React 19, TypeScript strict | `"strict": true`, `noUncheckedIndexedAccess: true`. |
| Package manager | **pnpm** | Commit `pnpm-lock.yaml`. Node 24 LTS (`.nvmrc`). |
| Styling | **Tailwind CSS 4** (CSS-first config via `@theme`) + plain CSS modules where Tailwind is awkward (keyframes, masks) | All design tokens live as CSS custom properties in `app/styles/tokens.css`, Tailwind reads them. No inline hex values anywhere in components. |
| Motion | **GSAP 3.15+** (core, ScrollTrigger, SplitText) + `@gsap/react` (`useGSAP`) | GSAP and all its plugins are free under the Standard "no charge" license since 2025, no Club membership needed. Do not install `gsap-trial`. |
| Smooth scroll | **Lenis** (latest 1.x) | Synced with GSAP ticker, drives ScrollTrigger. Native touch scrolling on mobile (Lenis default `syncTouch: false`). |
| Media CDN | **ImageKit** via `@imagekit/next` (2.x) | Project images and videos. Wordmark SVG and client logo SVGs live in the repo, not on ImageKit. |
| Fonts | `next/font/local`, self hosted woff2 | Mont (licensed), Archia (license to be confirmed, see §5). Never load fonts from a third party. |
| Analytics | **Umami** self hosted (cookieless) | Script tag only in production. No cookie banner needed. |
| Lint/format | ESLint (next/core-web-vitals + typescript-eslint strict), Prettier | `pnpm lint`, `pnpm typecheck` must pass before every commit. |
| Tests | Playwright (smoke + motion + reduced motion), Lighthouse CI | See §14. |
| Hosting | Dmytro's VPS, Nginx serving `out/` | Deploy via GitHub Actions over SSH. See §13. |

Do not add libraries without asking. Specifically no: framer-motion/motion, locomotive-scroll, react-spring, three.js (unless the grain flag in §10 needs a tiny shader, then hand written WebGL, no three), lodash, moment, styled-components, any UI kit, any icon font.

---

## 3. Repository layout

```
.
├── CLAUDE.md                    this file
├── docs/
│   ├── hardart-web.md           design spec (Daniel), read only for you
│   └── decisions.md             ADR style log, one entry per non-obvious technical decision
├── app/
│   ├── layout.tsx               html, fonts, providers, analytics
│   ├── page.tsx                 composes the seven sections in order
│   ├── not-found.tsx            404, same visual system, one line of copy, link home
│   ├── opengraph-image.tsx      static OG image (turquoise ground, wordmark), 1200×630
│   ├── icon.svg / apple-icon.png
│   └── styles/
│       ├── tokens.css           colours, type scale, spacing, breakpoints, easings
│       ├── base.css             reset, html/body, focus, selection, reduced motion
│       └── utilities.css        underline wipe, sr-only, etc.
├── components/
│   ├── sections/                Hero, WhoWeAre, WhatWeDo, Work, Clients, Contact, Footer
│   ├── motion/                  LenisProvider, ScrollLogo, RevealLines, WordSwap, RevealMedia, RevealStagger
│   ├── media/                   ProjectMedia (ImageKit video/image), ClientLogo (inline SVG)
│   ├── ui/                      Wordmark, Link (underline wipe), ProtectedEmail, Tag, Label
│   └── flags/                   Grain, MediaHover, Cursor (feature flagged, §10)
├── content/
│   ├── site.ts                  all copy, typed, one object; the ONLY place copy lives
│   ├── projects.ts              Project[] validated by zod at build
│   ├── clients.ts               Client[] (name, svg path, width hint)
│   └── people.ts                Daniel, Dmytro: obfuscated email parts, LinkedIn URLs
├── lib/
│   ├── features.ts              feature flags (§10)
│   ├── motion.ts                shared easings, durations, ScrollTrigger defaults, matchMedia helper
│   ├── email.ts                 encode/decode helpers for protected emails
│   └── imagekit.ts              url builder, transformation presets
├── public/
│   ├── fonts/                   woff2 only
│   ├── brand/hardart.svg        wordmark, uses currentColor
│   └── clients/*.svg            client logos, normalised, currentColor
├── scripts/
│   ├── fonts.ts                 OTF → woff2 + subset (fonttools), run once
│   ├── normalise-logos.ts       optical size check for client SVGs (reports, does not edit)
│   └── check-copy.ts            fails if any em dash (U+2014) or "Dimitro" appears in content/ or app/
├── tests/                       Playwright
├── .github/workflows/
│   ├── ci.yml                   lint, typecheck, build, tests on PR
│   └── deploy.yml               main → VPS
└── nginx/hardart.cz.conf        reference config, kept in repo, applied by hand on the VPS
```

---

## 4. Design tokens (proposed defaults, confirm with Dan on the live site)

The spec gives colours, faces and rules but not numeric scale. These are the starting values. They are tokens, so changing them later is a one line edit. Put them in `tokens.css` and reference them everywhere.

```css
:root {
  /* colour, from spec */
  --accent: #00FFC8;
  --paper:  #FFFFFF;
  --ink:    #1A1A1A;        /* never #000 */

  /* layout */
  --gutter: clamp(16px, 2.5vw, 40px);      /* single side gutter, content goes to the edges */
  --section-gap: clamp(6rem, 14vh, 12rem); /* space, not lines, between sections */
  --measure: 60ch;                          /* max line length for body paragraphs, applied at xl only */

  /* type, Mont */
  --fs-claim:     clamp(2.5rem, 5.6vw, 6rem);   /* hero claim; line-height .92; tracking -.03em */
  --fs-statement: clamp(2.25rem, 7vw, 8rem);    /* word swap line; second largest on page */
  --fs-h:         clamp(2rem, 4vw, 4.5rem);     /* section headings, names in What we do */
  --fs-body:      clamp(1.25rem, 1.05rem + .7vw, 1.5rem);  /* ~24px desktop, per spec "closer to 24 than 16" */
  --lh-body: 1.3;

  /* type, Archia */
  --fs-label: .75rem;  --ls-label: .12em;       /* tags, labels, footer meta; uppercase */

  /* motion */
  --ease-out: cubic-bezier(.22, 1, .36, 1);     /* fast out, slow settle, no overshoot */
  --dur-reveal: .5s;                            /* spec: 400–600 ms */
  --rise: 20px;                                 /* spec: 16–24 px travel */
}
```

Breakpoints (Tailwind 4 `@theme`): `sm 640`, `md 820`, `lg 1100`, `xl 1440`. Two-column layouts (What we do, footer grid) collapse below `md`.

Corner logo: height 22px desktop, 18px mobile, positioned at `--gutter` from top and left, `z-index` above everything, hit area at least 44×44.

---

## 5. Fonts

- Mont: OTF files and license exist. Convert to woff2 with `scripts/fonts.ts` (fonttools `pyftsubset`, unicode range latin + latin-ext, keep kerning, `--flavor=woff2`). Weights needed: Heavy (900) for claim/headings/names, Book (400) or Regular for body. Nothing else.
- Archia: files may exist, **license for web use is unconfirmed**. Build with it, but keep `content/fonts.md` noting the open question; do not ship to production until Dmytro confirms. Fallback if it fails: Mont Medium in small caps tracking for labels.
- Load with `next/font/local`, `display: 'swap'`, `preload: true`, `adjustFontFallback` with a metric matched fallback so line breaks move minimally during swap.
- The line-by-line reveal (§7 C) depends on line breaks. Every SplitText instance must be created after `document.fonts.ready` and re-split on resize (SplitText `autoSplit: true`).
- No italics anywhere. No font-synthesis: `font-synthesis: none`.

---

## 6. Content model

All copy comes from `content/site.ts`, typed, verbatim from `docs/hardart-web.md`. Components never contain string literals of copy.

```ts
// content/projects.ts
export const ProjectSchema = z.object({
  slug: z.string(),
  name: z.string(),
  url: z.string().url().optional(),
  media: z.object({
    kind: z.enum(['video', 'image']),
    src: z.string(),               // ImageKit path, e.g. /projects/tickets-gp/hero.mp4
    poster: z.string().optional(), // ImageKit path, image; required for video
    width: z.number(), height: z.number(),  // intrinsic, for aspect-ratio and zero CLS
  }),
  tags: z.array(z.string()).min(2).max(4),
  text: z.string().max(240),
})
```

Superseded by `docs/hardart-projects.md` (Daniel, 2026-09-13, see decision 022): featured projects (media, title, text, tags) and secondary projects (no media), titles are claims and the client name is never shown, tags come from Daniel's list (`TAGS` in `content/projects.ts`, 2 to 4 per project, unknown tags fail the build). The design set / engineering set rule no longer applies.

Until Daniel delivers content, ship **6 placeholder projects** with clearly fake names (`PLACEHOLDER 01`) and grey ImageKit sample media, behind a build-time check that refuses to deploy to production while any placeholder exists (`pnpm build` fails on `main` if `slug.startsWith('placeholder')`). Also test the layout with 30 items locally.

Clients: `{ name, file, widthHint }`. SVGs are inline (`<svg>` in the DOM via a small server component that reads the file at build), fill `currentColor`, ink on white. Optical equalisation is done in the SVG files themselves by Daniel; `scripts/normalise-logos.ts` only reports bounding boxes so you can flag outliers to him.

People: `{ name, emailUser: base64, emailDomain: base64, linkedin: string }`. Personal emails never appear as plain text or `mailto:` in HTML (§9).

---

## 7. Motion system, implementation of every move

General setup (`components/motion/LenisProvider.tsx`, `lib/motion.ts`):

```ts
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: false })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
ScrollTrigger.defaults({ once: true, start: 'top 85%' })
```

Reduced motion is handled with `gsap.matchMedia()`: every animation is registered inside `mm.add('(prefers-reduced-motion: no-preference)', ...)`. Outside that media query nothing animates, the logo is simply in the corner after the hero, the word swap shows `MEETINGS`. Lenis is not started when reduced motion is on. Also expose `?motion=off` query param for QA.

Prefer `opacity` and `transform` (compositor only). Other properties (background size, clip-path, filters) are allowed on small elements when a 6× CPU throttle trace still holds 60 fps; never animate layout (`top/left/width/height`). The per-move limits below (one transformation, short distances, once only, a single loop, no marquee, "nothing else moves") are lifted: treat the moves as the minimum, not the maximum.

Text is fully in the markup and readable without JS. Hidden-before-reveal state is applied by CSS only when `html.js` is present (inline script in `<head>` swaps `no-js` → `js`) and reduced motion is not preferred.

**A. Hero, on load.** Claim split into lines (`SplitText`, `type: 'lines'`, `mask: 'lines'`). Timeline starts after `document.fonts.ready`: each line `from { yPercent: 100, opacity: 0 }` `to { yPercent: 0, opacity: 1, duration: .6, ease: --ease-out, stagger: .08 }`. Logo does not animate. Total under 1 s. If fonts take longer than 1.5 s, reveal anyway.

**B. The logo, on scroll.** The signature move, spend time here.
- One `<a href="#top">` wordmark element, `position: fixed`, `transform-origin: top left`. No second copy in the hero; the hero reserves its space with an invisible sizing box of the same aspect ratio.
- On mount and on every `ScrollTrigger.refresh` (resize, fonts loaded, orientation change), measure: hero box rect (large state) and corner rect (small state, from tokens). Compute `scale = cornerHeight / heroHeight`, `x`, `y` deltas.
- `ScrollTrigger` with `scrub: true` (not a number, exact 1:1 with scroll), `start: 'top top'` of hero, `end: 'bottom top'` of hero (i.e. as the hero leaves the viewport), tween `x, y, scale` from large to small. `once: false` for this one, it is continuous both ways.
- Colour: ink throughout. Over the footer it flips to `--accent`: a second ScrollTrigger on the footer, `start: () => 'top ' + (cornerTop + cornerHeight) + 'px'`, `toggleClass` on the logo, CSS `transition: color .2s`. That is the only colour change on the page.
- Mobile: same behaviour, smaller sizes. Verify on real iOS Safari that URL bar collapse does not make the logo jump: use `100svh` for the hero, not `100vh`, and refresh ScrollTrigger on `visualViewport` resize with a debounce.
- Reduced motion: logo rendered in the corner from the start, hero shows a static large wordmark image instead (the same SVG, not fixed).

**C. Paragraph reveal.** `RevealLines` component wraps any block of text. `SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (self) => gsap.from(self.lines, { yPercent: 100, opacity: 0, duration: .5, ease, stagger: .06, scrollTrigger: { trigger: el } }) })`. `autoSplit` handles resize and font swap. Used for: Who we are, What we do lists, project texts, Clients line, Contact heading, footer paragraphs. Never word by word, never whole block.

**D. The word swap.** `WordSwap` with `options = ['MEETINGS','HANDOVERS','ACCOUNT MANAGERS','EXCUSES']`.
- Markup: the static parts of the line are plain text. The variable slot is a `display: inline-grid` where all options are stacked in the same grid cell (`grid-area: 1/1`), so the slot's width is the widest option and the line never reflows. Only one is visible at a time. Static text: `TWO PEOPLE.` on line one, `ZERO ` + slot + `.` on line two.
- Timeline: `repeat: -1`, per word: current `to { yPercent: -40, opacity: 0, duration: .45 }`, next `from { yPercent: 40, opacity: 0 }` to `{ 0, 1, duration: .45 }`, hold so that the cycle is ~2.5 s per word.
- Runs only in viewport: ScrollTrigger `once: false`, `onToggle: ({isActive}) => isActive ? tl.play() : tl.pause()`.
- Reduced motion or no JS: only `MEETINGS` is rendered visible. Screen readers: slot is `aria-hidden`, a `sr-only` span carries the full first sentence once.
- Other loops are allowed (the single loop rule is lifted); every loop pauses off screen.

**E. Work rows.** Media: `from { scale: 1.04, opacity: 0 }` `to { 1, 1, duration: .6 }`, `overflow: hidden` wrapper so scale does not bleed. Text and tags reveal with `RevealLines` in the same trigger. Nothing else moves.

**F. Client logos.** `RevealStagger`: `from { opacity: 0, y: 12 }`, `stagger: .04`, once. No marquee.

**G. Links and hover.** Pure CSS: `background-image: linear-gradient(var(--accent), var(--accent))`, `background-size: 0% 2px → 100% 2px`, `background-position: left bottom`, `transition: background-size .2s var(--ease-out)`. Same on `:focus-visible`. Applies to every text link. Icon links (mail, LinkedIn) get the same underline on a 1ch wide invisible text span beneath them, so the hover language stays one thing.

Performance rules for all motion: no ScrollTrigger `pin` except if needed for B (it is not), no `markers` in commits, `ScrollTrigger.config({ ignoreMobileResize: true })`, batch DOM reads before writes, test with 6× CPU throttle and confirm 60 fps on the logo scrub.

---

## 8. Sections, implementation notes

Order and copy exactly as `docs/hardart-web.md` §4. Notes that go beyond it:

1. **Hero.** `min-height: 100svh`, turquoise, logo upper area near full width, claim bottom, centred, three lines on desktop; on narrow screens lines may wrap but the claim keeps `--fs-claim` and fills the screen. Nothing else. No scroll hint. Section id `top`.
2. **Who we are.** One paragraph, `text-indent: 3em` on first line, no max-width below `xl` (spec: type near the edges); at `xl` apply `max-width: var(--measure)` so lines do not exceed readable length on ultrawide.
3. **What we do.** Two columns at `md+`, names in Mont Heavy `--fs-h`, discipline lists in Archia label style but body-sized (`1rem`, tracking `.06em`). Statement with WordSwap below, full width, left aligned.
4. **Work.** Section label `SELECTED WORK` (Archia). Vertical list, one `<article>` per row, media largest, `aspect-ratio` from content, then name (Mont Heavy), tags (Archia), text. On `md+` media left ~62% width, text column right, top aligned; below `md` stacked in the order media, name, tags, text. Must look right with 6 and with 30 rows: no per-row decoration that gets noisy.
5. **Clients.** Line above (RevealLines), then a flex-wrap strip of inline SVGs, `gap: clamp(1.5rem, 4vw, 4rem)`, each logo `height: clamp(20px, 2.2vw, 32px)`, `width: auto`. No boxes.
6. **Contact.** `TELL US ABOUT YOUR PROJECT` in `--fs-h`, `hello@hardart.cz` as a real `mailto:` text link (this one is public by design). Below: two rows, **Dmytro first, then Daniel**, each with mail icon (ProtectedEmail) and LinkedIn icon link.
7. **Footer.** `background: var(--ink)`, `color: var(--paper)`, three columns at `md+`, hairline `border-top: 1px solid rgb(255 255 255 / .2)` above each column heading (the only rules on the page), Archia for labels/meta. Bottom line `The kind of art that has a deadline.` in `--accent`, small. Under it, a legal line in Archia label style: `{{LEGAL_LINE}}` from `content/site.ts` (see §12). Footer is the only inverted surface.

Icons: two hand drawn SVGs (mail, LinkedIn "in" glyph) in `components/ui/icons.tsx`, stroke/fill `currentColor`, 20px. No icon library.

---

## 9. Email protection

Personal addresses: stored in `content/people.ts` as base64 user and domain parts. `ProtectedEmail` renders `<a href="#" aria-label="Email Daniel" data-u data-d>`; on click (and on Enter), it decodes, builds `mailto:` and sets `window.location.href`. Nothing containing `@` or `mailto:` for personal addresses exists in the HTML output. Add a Playwright test that greps `out/index.html` for the decoded addresses and fails if found. `hello@hardart.cz` is public and stays a normal link.

---

## 10. Feature flags, extras beyond the spec

Dmytro wants to evaluate a few effects beyond Daniel's spec. They are **all off by default**, implemented so that turning one on is one boolean in `lib/features.ts`, and each is isolated in `components/flags/`. Ship the site without them; Dmytro toggles them on the live site for Daniel to judge.

```ts
export const features = {
  heroGrain: false,     // subtle animated film grain over the hero turquoise
  mediaHover: false,    // project media reacts to hover (see below)
  cursor: false,        // custom cursor + magnetic links
} as const
```

- **heroGrain**: a full-hero `<canvas>` with a hand written fragment shader (WebGL1, no library) drawing monochrome noise at ~6% opacity, `mix-blend-mode: multiply`, animated at 12 fps (not 60, film grain looks better slow and costs less). Falls back to nothing on `prefers-reduced-motion`, on no WebGL, and while the tab is hidden. Must not affect LCP: mount after first paint with `requestIdleCallback`. Claim text stays crisp (canvas is behind text, `pointer-events: none`).
- **mediaHover**: on pointer devices only (`@media (hover: hover)`), the media inside a work row translates up to 6px following the pointer (parallax, `gsap.quickTo`) and scale 1.02, 300 ms out. Conflicts with the spec line "nothing else moves", which is why it is a flag.
- **cursor**: 12px ink dot following the pointer with `quickTo`, grows to 40px turquoise ring over links; links within 24px pull toward the pointer (magnetic). Pointer devices only, hidden on touch. Recommendation from Dmytro's engineer notes: this one is a 2021 cliché, expect Daniel to reject it. Implement last and cheaply.

Flags are read at build time; a disabled flag must tree-shake to zero bytes (check with `next build` bundle analysis).

---

## 11. Media pipeline (ImageKit)

- One ImageKit media library, folder per project: `/projects/<slug>/`. Daniel or Dmytro uploads originals (mp4 1080p, images at 2× intended size).
- `lib/imagekit.ts` exposes presets. Video: `tr=f-auto,q-70,w-1600` for desktop and `w-800` for mobile via `<source media>`; ImageKit serves webm/mp4 by `f-auto`. Poster: `ik-thumbnail.jpg?tr=so-0.5` (frame at 0.5 s) or an explicit poster image, `f-auto,q-75`.
- `ProjectMedia`: `<video muted loop playsInline preload="none" poster>` with `@imagekit/next` `Video`/`Image` where helpful; `IntersectionObserver` sets `src` and calls `play()` when within 1.5 viewports, `pause()` and unload when far away. Never more than 3 videos playing at once (the list can have 30). Never any controls, never sound.
- All media has explicit `width/height` → `aspect-ratio`, so CLS is 0 before load.
- `next.config.ts`: `images: { loader: 'custom' }` is unnecessary when using ImageKit components; if `next/image` is used anywhere, set `images.unoptimized = true` (static export has no optimiser) and route through ImageKit URLs.
- Wordmark and client logos are SVG in the repo, inlined, never rasterised, never on ImageKit.

---

## 12. SEO, meta, legal

- `metadata`: title `hardart`, description one sentence from the perex (`An independent creative development studio. Two people, ten years, no departments.`), canonical `https://hardart.cz/`, `lang="en"`, `theme-color #00FFC8`.
- OG/Twitter image: `app/opengraph-image.tsx` generating a 1200×630 turquoise card with the wordmark in ink, static at build (`export const dynamic = 'force-static'`). If Daniel supplies a designed PNG later, swap it.
- Favicon: SVG (`icon.svg`, wordmark "h" or the full wordmark if legible at 32px, ask Daniel), plus `apple-icon.png` 180px turquoise ground.
- JSON-LD `Organization` with name, url, email `hello@hardart.cz`, founders Daniel and Dmytro, `foundingDate: 2016`, `sameAs` LinkedIn URLs.
- `robots.txt` allow all, `sitemap.xml` with the single URL. `trailingSlash: false`.
- Legal line in the footer (Czech Civil Code §435 requires business identification online). Content comes from `content/site.ts`: `{{LEGAL_LINE}}`. Placeholder for now: `Dmytro Pechunka, IČO 17407613 · Daniel {{SURNAME}}, IČO {{DAN_ICO}}`. Dmytro confirms the final wording. Small, Archia, paper at 60% opacity on ink.
- Analytics: Umami script (`<script defer src="https://{{UMAMI_HOST}}/script.js" data-website-id="…">`) only when `NODE_ENV === 'production'` and `NEXT_PUBLIC_UMAMI_ID` is set. Cookieless, so no consent banner. Umami itself runs on the VPS under PM2 with Postgres, separate from this repo (see §13, phase 9).

---

## 13. Build, deploy, server

- `next.config.ts`: `output: 'export'`, `reactStrictMode: true`, `images.unoptimized: true`, `experimental.optimizePackageImports: ['gsap']`.
- `pnpm build` → `out/`. Build fails on: type errors, lint errors, em dash in copy, "Dimitro", placeholder projects on `main`, missing font files.
- **CI (`ci.yml`)** on every PR and push: install, lint, typecheck, `check-copy`, build, Playwright smoke, Lighthouse CI against the built `out/` served with `serve` (budgets in §14).
- **Deploy (`deploy.yml`)** on push to `main`, mirrors Dmytro's existing pattern (GitHub Actions → SSH → git pull → build → reload), adapted to static:
  1. `ssh $VPS 'cd /srv/hardart && git fetch && git reset --hard origin/main && pnpm install --frozen-lockfile && pnpm build'`
  2. `rsync -a --delete out/ /var/www/hardart.cz/` (atomic enough for a static site; if you want zero-window swaps, build into `releases/<sha>` and flip a `current` symlink).
  3. No PM2 process for the site. Nginx serves the directory.
  Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (deploy key, read only), `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_UMAMI_ID`.
- **Nginx** (`nginx/hardart.cz.conf`): HTTP→HTTPS, `www`→apex, HTTP/2, brotli or gzip, `root /var/www/hardart.cz`, `try_files $uri $uri.html $uri/ =404`, `error_page 404 /404.html`, cache: `/_next/static/` immutable 1 year, fonts 1 year, HTML `no-cache`. Security headers: HSTS (after confirming HTTPS works), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal, CSP allowing self, ImageKit (`ik.imagekit.io`) for media, Umami host for script/connect. TLS via certbot. Dmytro applies the config by hand; keep the file in the repo as the reference.
- Daniel reviews **directly on hardart.cz** (no separate preview). Until launch, the Nginx config has a commented `auth_basic` block Dmytro can enable if the site should not be public while in progress.

---

## 14. Quality bar, budgets, tests

Budgets (Lighthouse CI, mobile, throttled): Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100. LCP ≤ 3.0 s (Dmytro, 2026-09-14, decision 028: 1.5 s is out of reach under Lighthouse mobile throttling without cutting the hero animation; the hero stays text + SVG, nothing heavier may be in the first viewport), CLS = 0, INP ≤ 200 ms (TBT ≤ 200 ms in the lab), total JS as small as reasonably possible, never at the cost of features or animations (Dmytro, 2026-09-13); current ceiling 300 KB gzip, measured 228 KB in Phase 4 (Next 16 + React 19 runtime ≈ 173 KB, GSAP + plugins ≈ 50 KB, Lenis ≈ 6 KB). Raise the ceiling in a decision when a feature needs it, no third party requests before interaction except fonts (self) and Umami.

Playwright (`tests/`):
- smoke: page renders all seven sections, copy matches `content/site.ts` verbatim.
- motion: after scrolling past the hero, the logo has the corner transform; over the footer it has the accent class; word swap changes text within 3 s while visible and does not change while scrolled away.
- reduced motion (`emulateMedia({ reducedMotion: 'reduce' })`): no transforms applied, logo in corner, swap shows `MEETINGS`, page is fully readable.
- email: `out/index.html` contains no personal address and no `mailto:` except `hello@hardart.cz`.
- visual: removed (Dmytro, 2026-09-14, decision 032). Screenshot baselines failed CI on every deliberate design change and blocked the deploy; layouts are checked by eye at 390, 820, 1440.
- a11y: axe-core run, zero violations.

Manual checks before calling a phase done: real iPhone Safari and Android Chrome (scroll, logo move, video autoplay, URL bar behaviour), keyboard only navigation with visible focus, 6× CPU throttle 60 fps on logo scrub, fonts blocked (readable fallback), JS disabled (all text visible, logo in hero, no broken layout).

---

## 15. Working rules for Claude Code

- Work in small PRs per phase (§16). Conventional commits (`feat(motion): …`, `fix(hero): …`). Never commit directly to `main`.
- Before you finish any task: `pnpm lint && pnpm typecheck && pnpm test`. Fix, do not skip.
- Do not touch copy. If copy looks wrong, say so, do not fix it. `scripts/check-copy.ts` is your guardrail.
- Do not invent design values silently. Use tokens; when a token is missing, propose a value, add it to `tokens.css`, and log it in `docs/decisions.md` under "to confirm with Dan".
- Keep components small and dumb. Motion logic lives in `components/motion/` hooks, sections only compose.
- No `any`, no `// @ts-ignore`, no `!important`, no `useEffect` for animation (use `useGSAP` with scoped selectors and cleanup).
- Every non-obvious technical decision gets 3 to 6 lines in `docs/decisions.md`: context, decision, consequence.
- When something in `docs/hardart-web.md` is ambiguous, ask Dmytro with a concrete proposal ("I read X as Y, implementing Y unless you say otherwise").
- Do not run destructive git commands, do not change CI secrets, do not modify the Nginx config on the server yourself.

---

## 16. Build plan, phases with acceptance criteria

Work through these in order. Each phase is one PR. Do not start the next phase until the current one meets its acceptance criteria and Dmytro has merged it.

**Phase 0, Scaffold.**
Next 16 + TS strict + Tailwind 4 + ESLint/Prettier + pnpm + `.nvmrc` + `output: 'export'`. Repo layout from §3 with empty files. `check-copy` script. CI workflow running lint/typecheck/build. `docs/decisions.md` with entry 001 (stack).
Done when: `pnpm build` produces `out/index.html` with "hardart" in it, CI green.

**Phase 1, Tokens, fonts, base.**
`tokens.css`, `base.css` (reset, `html.no-js/js` swap, focus-visible style: 2px `--accent` outline offset 2px, selection colour accent/ink, `font-synthesis: none`, `scroll-behavior: auto` because Lenis handles it), font conversion script run, `next/font/local` wired, Wordmark component (inline SVG, currentColor), Link underline wipe utility, Label/Tag primitives.
Done when: a test page shows the claim in Mont Heavy at `--fs-claim`, a label in Archia, a link with the wipe on hover and focus, fonts preloaded (check `<link rel=preload>` in HTML), no layout shift on font load (CLS 0 in Lighthouse).

**Phase 2, Static page, no motion.**
All seven sections with final copy from `content/site.ts`, placeholder projects and client logos, static layout at 390/820/1440. Corner logo simply fixed in the corner from the start (this is also the reduced-motion end state). ProtectedEmail. Footer with legal placeholder. 404 page. Metadata, OG image, favicon, JSON-LD, robots, sitemap.
Done when: visual baselines captured, axe zero violations, Lighthouse all 100/≥95, email test passes, keyboard navigation works, JS-disabled screenshot identical to JS-enabled except motion.

**Phase 3, Motion core.**
LenisProvider, GSAP setup, `matchMedia` reduced-motion gate, `RevealLines` (move C) applied everywhere the spec says, hero load sequence (move A), `?motion=off` param.
Done when: line reveals are exactly line based (inspect DOM), replay never happens on scroll up, resize re-splits without visible jump, reduced motion shows everything static, fonts-blocked scenario still reveals.

**Phase 4, Signature logo move (B).**
Fixed wordmark, scroll-scrubbed scale/translate from hero to corner, footer colour flip, `100svh` hero, `visualViewport` handling.
Done when: 60 fps at 6× CPU throttle in Chrome DevTools performance trace, no jump on iOS URL bar collapse, position exact at every viewport in visual tests (add a mid-scroll screenshot), colour flips only over the footer.

**Phase 5, Word swap (D), work rows (E), client logos (F).**
Done when: the swap line width never changes (assert bounding box in Playwright across all four words), pauses off screen (assert), only `MEETINGS` under reduced motion; work media settles from 1.04; logos stagger once.

**Phase 6, Media pipeline.**
ImageKit provider, `ProjectMedia` with lazy load/unload, posters, 3-concurrent-video cap, transformation presets, 30-item stress test page under `/dev/work-30` (dev only, excluded from export).
Done when: with 30 videos, scrolling the list keeps ≤ 3 `<video>` elements playing, network tab shows no media loaded for rows far below the fold, CLS stays 0, mobile data usage for a full scroll ≤ 15 MB.

**Phase 7, Feature flags.**
`heroGrain`, `mediaHover`, `cursor` per §10, each behind its flag, each zero bytes when off (verify bundle).
Done when: toggling each flag alone works, all three together do not fight (cursor over media hover), Lighthouse with all flags on still ≥ 90 performance, reduced motion disables all three.

**Phase 8, Hardening.**
CSP, security headers in the Nginx reference config, Lighthouse CI budgets enforced in CI, Playwright suites complete, `docs/decisions.md` complete, README with setup and content-update instructions for Daniel's deliveries (how to add a project, how to add a client logo).
Done when: CI enforces everything in §14 and is green.

**Phase 9, Deploy.**
`deploy.yml`, Nginx config applied by Dmytro, TLS, `www` redirect, first deploy to hardart.cz, optional basic auth. Umami installed on the VPS (separate PM2 app + Postgres), website id wired via secret.
Done when: push to `main` updates hardart.cz within 3 minutes, Umami shows a page view, headers verified with `curl -I`, securityheaders.com grade A.

**Phase 10, Content and launch.**
Replace placeholders with Daniel's projects, logos, LinkedIn URLs, legal line, Archia license confirmed or fallback applied. Final visual review with Daniel on the live site, decide feature flags, remove basic auth.
Done when: no placeholder in `content/`, build guard passes on `main`, Daniel signs off.

---

## 17. Open items (not yours to resolve, but track them)

Keep this list current in `docs/decisions.md` → "Open items" and remind Dmytro when a phase is blocked by one.

- Archia web license (Dmytro/Daniel).
- Client logo SVGs, optically equalised, and confirmation per client that the logo may be shown (direct contract, no NDA). Do not include Creditas.
- Project content: name, url, media, tags, text for each project (Daniel).
- LinkedIn URLs for both (Daniel, Dmytro).
- Daniel's legal identification for the footer line, or the decision to show only Dmytro's.
- Whether the favicon is the "h" or the full wordmark (Daniel).
- Type scale confirmation on the live site (Daniel, after Phase 2).
- Feature flag decisions (Daniel, after Phase 7).
