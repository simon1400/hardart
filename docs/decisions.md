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

**Consequence.** Visual regressions were caught only locally until Phase 8; since then linux baselines from `.github/workflows/visual-baselines.yml` run in CI (decision 028).

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

## 016. Motion architecture: markers in sections, controllers in components/motion

**Context.** Phase 3 needs line reveals on about forty elements. A client component per element would ship a hydration boundary per paragraph and keep copy inside client props.

**Decision.** `RevealLines`, `RevealStagger` and `Reveal` are server components that only add `data-reveal` (`lines`, `stagger`, `fade`, `rise`) and `data-reveal-on="load"`. One client `RevealController` (in `app/page.tsx`) sets up every marker after `document.fonts.ready` (or 1.5 s), inside `gsap.matchMedia`. `LenisProvider` (layout) runs Lenis on the GSAP ticker; `lib/motion.ts` registers the plugins and the defaults. Details that are not in CLAUDE.md §7:

- Ease `power4.out`: it is the quint out curve, the same as `--ease-out` (`cubic-bezier(.22, 1, .36, 1)`), without CustomEase.
- Default start `clamp(top 85%)`: the closing lines of the footer never reach 85 % of the viewport and would stay hidden.
- Elements that move themselves (`fade`, `rise`) are triggered by their parent, otherwise ScrollTrigger measures them with the offset applied.
- One `ScrollTrigger.refresh()` after all splits, because starts computed during setup were stale.
- `will-change` is not set on lines: GSAP's `force3D: auto` promotes them only while tweening and `clearProps` removes the transform afterwards. The logo sets it only while its trigger is active.
- CSS loops (clients marquee) pause off screen through `data-pause-offscreen`.

**Consequence.** Sections stay server components and only compose. Adding a reveal is one wrapper.

## 017. Reveal gate, ?motion=off and the fallback

**Context.** Text must be readable without JS and under reduced motion, and must not flash before its reveal.

**Decision.** `[data-reveal]` is `opacity: 0` only under `html.js`, not `.motion-off`, and `prefers-reduced-motion: no-preference`. The inline head script sets `motion-off` for `?motion=off`, which behaves like reduced motion everywhere (no Lenis, no reveals, logo docks, marquee and screenshot loops stop). If the motion bundle never runs, a CSS animation shows the content after 3 s; `html.motion-ready` (set by the controller) cancels that fallback. Full page visual baselines are taken with `?motion=off` and are pixel identical to the no-JS render and to the Phase 2 baselines. Axe runs on the revealed page and on `?motion=off`, because its link name check treats text at opacity 0 as missing.

**Consequence.** On a very slow connection where JS arrives after 3 s, content above the fold may show, then reveal again.

## 018. SplitText workarounds

**Context.** SplitText 3.15 with `mask: 'lines'` broke three things on this page.

**Decision.**

- `text-indent` is inherited by the word wrappers SplitText measures with, so every word was 5em wider and lines broke far too early. Split `div`s reset the indent; only the first line mask takes it back. Line breaks were checked to match the unsplit paragraph exactly.
- `deepSlice` leaves an empty copy of an inline element in front of it when a link or highlight starts a line (an unnamed extra tab stop, a stray accent sliver). Empty copies are removed in `onSplit`.
- Masks bleed `0.15em` up and down with negative margins (commas, the highlight background, claim leading 0.98); lines start at `yPercent: 120`.
- `aria: 'none'`: lines are whole lines of real text, so the default `aria-label` on a `p` (an axe violation) is not needed.

**Consequence.** Re-check these after a GSAP upgrade; the motion tests cover indent line count and the axe test covers empty links.

## 019. Scroll logo (move B)

**Context.** The wordmark has to travel from the hero (top left, `--wordmark-w`, letters on the top edge) into the corner (`--logo-corner-h`), 1:1 with scroll, without a second visible copy and without a jump at hydration.

**Decision.**

- The fixed link stays the 44px corner hit area and never moves; the mark inside it is laid out at hero size (`.is-live`) and transformed. Hit area and focus ring stay where the logo ends up.
- Geometry is measured from real rects (hero wordmark, corner slot, untransformed mark) on setup and on every refresh; nothing is duplicated in JS. Position is linear in scroll, scale geometric, so the shrink looks even. The range is the hero height (`top top` to `bottom top`).
- The hero keeps its static `<h1>` wordmark as the no motion state. The live mark covers it exactly (asserted to 0.5px in tests) and the static one goes to `opacity: 0` in the same layout effect, so the h1 keeps its accessible name.
- Without motion the corner logo appears once the hero wordmark has left (`.is-docked` via ScrollTrigger; without JS the same from a CSS scroll timeline). No travel, no scale.
- Footer colour: first a whole logo flip at the middle of the logo, replaced the same day by an ink to accent change during the shrink (decision 021).
- Refresh on `visualViewport` width changes only, debounced; the hero is `100svh` and `ignoreMobileResize` is on, so the iOS URL bar never triggers a mid scroll refresh.
- Measured: 60 fps (p95 16.8 ms, no frame over 20 ms) scrubbing the hero at 6x CPU slowdown in Chrome; CLS 0; mobile load LCP 1.39 s at 4x CPU and Fast 4G.

**Consequence.** On a 1440x900 desktop the footer is shorter than the viewport, so the corner logo never sits over it and never turns accent; it does on phones and short windows. Real iPhone behaviour (URL bar, momentum scroll) is still to be checked by hand.

## 020. JS budget is over before motion

**Context.** CLAUDE.md §14 sets 160 KB gzip of JS. Measured on the Phase 4 build: 228 KB gzip on `/`. The Next 16 and React 19 runtime chunks alone are about 173 KB; GSAP with ScrollTrigger and SplitText is about 50 KB, Lenis about 6 KB.

**Decision (Dmytro, 2026-09-13).** The budget may grow as far as features and animations need, within reason, and stays as small as possible without cutting either. CLAUDE.md §14 now sets a 300 KB gzip ceiling; raising it needs a decision entry.

**Consequence.** Phase 8 enforces 300 KB in Lighthouse CI. Size still matters: prefer CSS and small hand written code over new libraries.

## 021. Corner logo turns accent as it shrinks

**Context.** Docked in the corner, the ink logo disappeared over ink content. A per pixel inversion (backdrop filter inside the wordmark shape, paper over dark content, an accent copy along the footer edge) was built and rejected the same evening: Dmytro did not like how it looked. Daniel's screenshot shows the small logo in turquoise instead.

**Decision (Dmytro, 2026-09-13).** The wordmark changes from ink to accent while it shrinks, tied 1:1 to the same scroll, and stays accent in the corner everywhere, the footer included. Two identical inline marks are stacked: the accent one fades in with the progress (opacity only, no repaint of the scaled layer) and the ink one is hidden once docked, so no dark fringe remains around the accent edges. Without motion the corner logo is simply accent. The footer flip trigger and all inversion code are removed.

**Consequence.** Over paper the small turquoise logo has about 1.3:1 contrast; it is a decorative link with an accessible name, so axe does not flag it, but it is less legible than ink. Over the turquoise top of the Who we are gradient it blends in until white is under it.

## 022. Project content from Daniel: featured and secondary

**Context.** `docs/hardart-projects.md` (Daniel, 2026-09-13) gives 14 projects: 9 featured with media, 5 secondary without. Titles are 20 to 40 character claims and the client name is never set; tags are Daniel's own (31 of them, not yet unified) and ignore the design set / engineering set rule.

**Decision.**

- `content/projects.ts` has `featuredData` and `secondaryData` with separate schemas (featured requires a video or image, secondary allows no media fields). `client` holds Daniel's project heading (the domain), used only to describe media for screen readers.
- Tags validate against Daniel's list (`TAGS`), 2 to 4, so typos fail the build. The old set rule is removed from the schema, CLAUDE.md §6 and `docs/content.md`.
- Page order of featured projects stays as before (Daniel's document is alphabetical); secondary follows his document. No project is `draft` any more.
- Secondary projects are not a new section: they continue the Work list as a typographic index under the featured rows. Title left (project title size), text in body size and tags right, stacked on phones. The visual is the accent marker from the section headings, drawn behind each title by the scroll (background size, scrubbed both ways, line by line through `box-decoration-break: clone`); the title fades up once, text reveals by line, tags stagger.

**Consequence.** When Daniel unifies the tags, only `TAGS` and the entries change.

## 023. Motion restrictions lifted in the spec

**Context.** Dmytro, 2026-09-13: remove everything in the spec that limits animation, the goal is wow.

**Decision.** `docs/hardart-web.md` §3 now keeps only four principles: text readable without motion, 60 fps, reduced motion respected, loops paused off screen. The limits on one transformation, short distances, once only, a single loop, no marquee and "nothing else moves" are gone, and the moves are a starting point. CLAUDE.md §1 and §7 follow: transform and opacity are preferred, other properties are allowed on small elements when a 6x CPU trace holds 60 fps, layout properties are never animated.

**Consequence.** Phase 5 onwards is designed for impact rather than restraint; every new move still gets the reduced motion and off screen checks.

## 024. Section motion (Phase 5)

**Context.** Moves D, E, F plus extra moves approved by Dmytro on 2026-09-13: hero claim exit, scroll drawn markers, statement slide, footer curtain. The clients marquee stays a CSS loop with its existing fade in (no scroll velocity).

**Decision.**

- Markers stay in server sections (`data-word-swap`, `data-statement`, `data-mark-scrub`, `data-parallax`, `data-curtain`, `data-exit`, reveal kind `media`); `components/motion/scenes.ts` sets them up from `RevealController`, before the reveals and before the one refresh.
- D. All options share one inline grid cell, the trailing full stop travels with each word, so the free space of a short word sits at the line end. The loop is a repeating one cycle timeline that calls the change, played by a ScrollTrigger toggle. The statement is now `nowrap` on phones too, otherwise the grid shrank and wrapped `ZERO` away from the word.
- E. Two transform layers inside each frame (`.media-reveal` rises, `.media-reveal-inner` counter moves and settles from scale 1.25, expo out, 1.4 s), so the screenshot's own CSS transform is untouched and no clip-path is repainted. Website frames float ±6 % with a scrub from md up; the grid cell is the trigger, the frame inside it moves.
- Claim exit scrubs the SplitText masks (the lines belong to the load reveal); the top line rises 0.36 vh more than it scrolls, lower lines proportionally less, opacity reaches 0 at half the hero. Rebuilt on every re-split, killed in `onRevert`.
- Markers: GSAP scrubs `--mark` on the element; `.section-mark` and `.highlight` read it as background size and fall back to 100 % without motion. Split lines inherit it, so re-splits need nothing.
- Curtain: `main` is a positioned paper sheet above the footer; the footer moves from `-offset` to 0 between main's bottom reaching the viewport bottom and max scroll (trigger is `main`, which does not move). A footer that fits the viewport is pinned to the bottom edge; a taller one (phones) lags by `0.5 × padding × F / (F − vh)`, which keeps its first heading on screen for a while. Reveals inside the footer compute their start from that linear model (`curtainStart`), uncovered and above 85 %, because a moving trigger measures wrong.
- Measured, 1440×900, 6x CPU, wheel scroll top to bottom: motion alone 0 and 1 frames over 20 ms in two runs (p95 16.8 ms). With media loading, about 20 frames of 33 to 67 ms, all inside the work rows while videos start and screenshots decode (Phase 6). JS 224 KB gzip.

**Consequence.** Full page baselines (motion off, no JS) are unchanged; only the logo move frames changed. The footer is under the page until the end, so anything added to it must stay inside the footer element to be covered correctly.

## 025. Media pipeline (Phase 6)

**Context.** The nine delivered videos were 56 MB as raw copies (up to 1800x1800, 60 fps, one with audio), against a 15 MB budget for a full mobile scroll. There were no posters, every `ProjectVideo` managed itself, and at 6x CPU the work rows dropped about 20 frames while videos started.

**Decision.**

- `pnpm media` transcodes with `ffmpeg-static` (dev dependency, approved by Dmytro 2026-09-13): crop to 16:9, no audio, at most 30 fps, H.264 faststart; `video.mp4` up to 1600 px (CRF 26, 2 Mbit ceiling) and `video-800.mp4` (CRF 28, 800 kbit). Posters are the first detailed frame of the opening 3 s (image entropy, because several videos open on flat black or white), in 1600 and 800 px WebP; screenshots also get a 600 px copy. pnpm skips the ffmpeg install script (`ignoredBuiltDependencies`), the media script downloads the binary on first use, so CI never fetches it.
- The `-800`/`-600` files are the local stand-ins for the ImageKit width presets; `lib/imagekit.ts` builds either from one `mediaUrl(slug, file, preset, size)`. Phones (below md) get the small size through `<picture><source media>` for images and a `matchMedia` check when the video source is attached, not through density based `srcset`, which would pick the large file on a 3x phone.
- The poster is an `<img loading="lazy">` under the video, not the `poster` attribute (which loads eagerly for every row). It is the still state without JS, under reduced motion and `?motion=off`, where no video source is ever attached. The video fades in over it on `playing`.
- One module controller (`components/media/videoController.ts`) with three IntersectionObservers: attach within 1.5 viewports (preload auto, so the first frame is ready when the window opens), detach beyond 3 viewports (remove `src` and `load()` to free the buffer), play the most visible up to 3. A video still clipped by its media reveal has visibility 0, so playback starts only as the frame opens. Hidden tabs pause everything.
- `/dev/work-30` is `app/dev/work-30/page.dev.tsx`; `pageExtensions` includes `dev.tsx` only for `next dev`, so the export never contains it.
- Measured: 1440x900, 6x CPU, wheel scroll top to bottom with videos playing, 0 frames over 20 ms in two runs (p99 16.8 ms; Phase 5 had about 20 frames of 33 to 67 ms). 390x844 full scroll: 9.2 MB in total, 8.9 MB of it media, no media on the first screen, CLS 0. `/dev/work-30`: at most 2 playing and 7 attached while scrolling, 3 playing with 13 on screen in a tall window, CLS 0. JS 226 KB gzip.

**Consequence.** Media tests (`tests/media.spec.ts`) skip in CI, which builds without media. Real phones may refuse autoplay in Low Power Mode; the poster stays. Production bytes were re-measured with ImageKit the same day (decision 026).

## 026. ImageKit: images transformed, videos served as encoded

**Context.** ImageKit account `nyr5zupwx` delivered on 2026-09-13; Dmytro wants it in production and in local builds. Measured on ticketsgp: ImageKit re-encodes video to webm at 7.6 MB for `w-1600` and 2.7 MB for `w-800`, against 4.1 and 1.7 MB from `pnpm media`, and a browser that does not accept webm (Safari, every iPhone) gets a 4.2 MB mp4 at `w-800`. Its image presets are slightly smaller than the local WebP and serve AVIF where supported.

**Decision.**

- Videos: both sizes (`video.mp4`, `video-800.mp4`) are uploaded and requested with `tr=orig-true`, ImageKit acts as a CDN only (`OWN_SIZES` in `lib/imagekit.ts`). Posters, images and screenshots use the width presets on the full size file.
- `pnpm media:upload` (`scripts/upload-media.ts`) uploads through the ImageKit REST API with the private key from `.env.local`, skipping files whose remote size matches. No SDK dependency.
- The endpoint is in `.env.local` locally and in the GitHub secret `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` for the deploy (Phase 9). CI keeps building without it, so its tests stay offline. The private key is only needed on the machine that uploads.
- The screenshot scroll duration moved from the build (sharp reading the local file) to the browser (`naturalHeight / naturalWidth` on load), because the production build on the VPS has no media files.
- Measured with ImageKit: 390x844 full scroll 8.9 MB (8.6 MB media), CLS 0, no media on the first screen; 1440x900 at 6x CPU 2 single frames of 33 ms in the whole scroll, p95 16.8 ms. All 43 tests pass on the ImageKit build.

**Consequence.** New media needs `pnpm media` and then `pnpm media:upload` before a deploy shows it. The private key was shared in a chat session; Dmytro rotates it later and updates `.env.local`.

## 027. Feature flags (Phase 7)

**Context.** CLAUDE.md §10: three extras beyond the spec (`heroGrain`, `mediaHover`, `cursor`), off by default, one boolean each, zero bytes when off, 60 fps with all on. Turbopack bundles every client component a server component imports, rendered or not: a `false ? <Grain /> : null` still shipped the grain code in the shared page chunk.

**Decision.**

- `featureDefaults` in `lib/features.ts` is the one boolean per flag. `next.config.ts` resolves it plus `HARDART_FLAGS` (comma separated names or `all`, for local checks and CI) into `HARDART_FLAG_<name>` env constants, and aliases each disabled flag's module (`@/components/flags/<Name>`) to `components/flags/Off.tsx`, a server stub. Verified by grepping `out/`: nothing of a disabled flag ships. JS on `/`: 225.0 KB gzip off, 227.4 KB with all three.
- `heroGrain`: WebGL1 canvas, per pixel hash noise, a new seed at 12 fps, one canvas pixel per CSS pixel (`image-rendering: pixelated`), `mix-blend-mode: multiply` at `--grain-opacity` behind the hero content (the hero is `isolate`, the canvas `z-index: -1`). Starts on `requestIdleCallback` (Safari: 500 ms timeout); stops off screen and in hidden tabs.
- `mediaHover`: a third layer (`[data-media-hover]`) inside the reveal layers, so the parallax frame, the reveal layers, the video and the poster are untouched. Travel is capped by the overscan of the 1.02 scale (under 4 px on the website frames), so the frame edge never shows. The layer keeps `will-change` and 3D transforms while off rest, so following the pointer never repaints the video.
- `cursor`: ink dot, turquoise ring within 24 px of a link. The dot turns paper over the footer and the ring ink over the hero, decided by geometry (below the bottom of `main` is footer, above the hero bottom is hero), not by hit testing. Links lean toward the pointer (at most 10 px across, 4 px up and down, because text links sit in clipping line masks); a single line inline link becomes `inline-block` only if its text does not move, multi line links and the corner logo do not lean. The native cursor is hidden only while the custom one is shown.
- Performance: link boxes are measured in page coordinates (offset chain, immune to running reveal transforms) on every ScrollTrigger refresh; footer links, which ride the curtain, are read live only while the pointer is over the footer. Events only record; one GSAP ticker callback, prioritised before GSAP renders, does all reads, then all writes. Reading after a `quickTo` call forced a style and layout pass every frame.
- Gates: `(prefers-reduced-motion: no-preference)` and not `?motion=off` for all three; `(hover: hover) and (pointer: fine)` for `mediaHover` and `cursor`, plus `pointerType` checks.
- Tests: `tests/flags.spec.ts` checks zero bytes for disabled flags, and behaviour, reduced motion, `?motion=off` and touch for enabled ones. CI runs it on a second build with `HARDART_FLAGS=all`; media hover tests skip there (no media).
- Measured, 1440x900, 6x CPU, wheel scroll through the whole page with the pointer moving on every step, headless Chromium on the GPU (`--enable-gpu --use-angle=d3d11`), warm cache: all flags 16 and 19 frames over 20 ms of about 845, default build 23 and 16; p95 16.8 ms in both. The first cold run is about 60 to 80 in both (media loading). Headless without the GPU (SwiftShader) and a visible window on a busy desktop gave misleading numbers.

**Consequence.** Turning a flag on for the live site is `featureDefaults.<name> = true` and a deploy. A new flag needs its module name in `flagModules` and an export in `Off.tsx`.

## 028. Hardening (Phase 8): CSP, headers, Lighthouse CI, hero LCP

**Context.** Phase 8 enforces CLAUDE.md §14 in CI and writes the security headers. Next's static export inlines about 16 `self.__next_f` payload scripts per page whose text changes with every build, so a static Nginx CSP can only allow them with `'unsafe-inline'`. The first Lighthouse CI run (mobile, simulated throttling) scored Performance 89 to 91 with LCP 3.3 to 3.7 s: the LCP element was the hero claim, hidden until the JS bundle split and revealed it.

**Decision.**

- CSP in two layers, both enforced by the browser. `scripts/csp.ts` runs after `next build` and writes a `<meta>` policy into every exported HTML file, right after the charset: inline scripts only by sha256 hash, `style-src 'self'` (GSAP and SplitText only touch styles through the CSSOM), ImageKit in `img-src`/`media-src`, Umami in `script-src`/`connect-src`, origins from the build env (`lib/security.ts`). `nginx/hardart-headers.conf` sends the same policy with `'unsafe-inline'` instead of hashes plus `frame-ancestors 'none'`, and HSTS (one year, no subdomains), `nosniff`, `X-Frame-Options DENY`, `Referrer-Policy`, a minimal `Permissions-Policy` and COOP. The snippet is included in every location, because `add_header` in a location drops the server level ones. `tests/security.spec.ts` checks that the snippet equals `headerPolicy()`, that the meta hashes match every inline script, and walks the page (and the flags build in CI) under both policies with zero violations; a planted inline style and a foreign image were caught when the test was checked.
- Umami: `layout.tsx` renders the script only in production builds with both `NEXT_PUBLIC_UMAMI_HOST` and `NEXT_PUBLIC_UMAMI_ID`; the Nginx snippet has `{{UMAMI_HOST}}` until Phase 9.
- Hero claim (move A) no longer waits for JS. Each line rises in CSS out of a static mask span (`.claim-mask`, `overflow-y: clip`, the same 0.15em bleed as the SplitText masks; transform only, 0.6 s, 0.08 s stagger), paused on the hidden first frame until the head script adds `fonts-ready` (`document.fonts.load` of Mont Bold, or 1.5 s), so the fallback font never shows. Transform only keeps the rise on the compositor while the main thread sets up the other reveals; a first version animated clip-path, which repaints on the main thread and dropped 11 to 12 frames over 20 ms during load at 6x CPU against 3 before Phase 8. No opacity in the keyframes: Chrome ignored text that first paints transparent and reported no LCP at all. The claim is not split any more; the exit scrub moves its three masks directly, which on phones means three sentences instead of five visual lines. The claim block fills the hero below the wordmark with its lines at the bottom, so the font swap cannot move its top (CLS 0.041 under devtools throttling before).
- Line masks: adjacent negative margins collapse to one, so each split paragraph was 0.15em per line taller than the unsplit text (28 px on the phone claim, visible on resize). The overlap now sits on the top margin of every mask after the first; the claim matches the unsplit layout to 0.06 px, the page is 53 px taller than without motion at 390 px instead of 309 px (the rest is inside Who we are, hidden until its reveal).
- LCP budget (Dmytro, 2026-09-14): 3.0 s instead of 1.5 s. Lantern counts every request that finished before the observed LCP, and on a local server the 230 KB of JS finish within 40 ms, so the simulated LCP includes them however early the claim paints; with devtools throttling even FCP is 1.6 s. Lighthouse CI (`lighthouserc.json`, `pnpm lighthouse`): mobile, simulated, median of 3, Performance ≥ 0.95, Accessibility, Best Practices and SEO 1, LCP ≤ 3000 ms, CLS 0, TBT ≤ 200 ms (the lab stand-in for INP). `pnpm check-budget` measures the JS itself (gzip level 6 of every script on the page, 300 KiB ceiling), because Lighthouse 12 no longer has resource budgets. A test asserts no requests to other origins than the site and its ImageKit media before interaction.
- Reveal setup runs in slices of at most 12 ms (under one frame) with a macrotask yield in between, in page order, then one ScrollTrigger refresh. The single setup task (about 40 SplitText splits, each forcing layout) was the longest task on the page: 275 ms on the CI runner, TBT 230 to 240 ms. Locally TBT went from 90 to 10 to 20 ms. A/B against the Phase 7 build, 1440x900, 6x CPU, headless on the GPU, first 3 s after navigation, three runs each: p95 frame 17.0 ms in both, 3 frames over 34 ms in both, 6 to 7 frames of 20 to 34 ms against 3 to 4 (main thread only, nothing visible animates there during load); a wheel scroll through the page was equally noisy in both builds. Elements not set up yet stay hidden by the CSS gate for those few frames.
- CPU throttling in CI is 2x instead of the default 4x: GitHub runners report a Lighthouse benchmark index of about 2400 against 4700 on the dev machine, and with 4x they emulated a phone twice as slow (first CI run: Performance 0.83, TBT 580 to 970 ms). Lighthouse scales the multiplier to the host for this reason; if runners change, compare `environment.benchmarkIndex` in the uploaded reports.
- Linux visual baselines are rendered by the manual workflow `visual-baselines.yml` on the CI image and committed as `visual: …`; CI now runs `@visual` against them (js and no-js projects).
- Measured: locally Performance 95, FCP 1.1 s, LCP 2.9 s, TBT 10 to 20 ms, CLS 0; in CI (runner, 2x CPU) Performance 0.98, LCP 2.4 s, TBT 30 to 40 ms, CLS 0; Accessibility, Best Practices and SEO 100; JS 225.5 KiB gzip.

**Consequence.** Every build rewrites the HTML after Next, so anything that post-processes `out/` must run before `scripts/csp.ts` or re-run it. A new third party host goes into `lib/security.ts` and the Nginx snippet together. Real users on a slow connection see the claim once Mont has loaded plus 0.6 s; Chrome does not report that paint as LCP (the first paint is fully clipped), which only matters for field data.

---

## To confirm with Dan

- Label weight: Mont Book (500) at 12px with .12em tracking. Regular (600) is the alternative if labels read too light.
- Mobile layout of every section (the XD only has desktop). Claim on phones: five balanced lines at 11.5vw.
- What we do and Contact are not designed in the XD yet.
- Clients marquee order (roughly by recognisability) and where the "household names" line goes (under the marquee for now).
- 404 copy is a proposal, not in the spec: "Nothing here." / "Back to hardart".
- Favicon and apple icon use the "h" of the wordmark on turquoise.
- Corner logo is turquoise once docked (decision 021): low contrast over paper and invisible over the turquoise top of the gradient.
- Secondary projects as a typographic index with a scroll drawn marker behind the titles (decision 022).
- Tags are not unified yet (RESEARCH / MARKET RESEARCH / USER RESEARCH, UX / UX/UI / UX/UI/CX, WEB / WEB DESIGN); Daniel offered to unify them.
- Order of the featured projects on the page (kept from before, Daniel's list is alphabetical).
- Video posters are picked automatically (decision 025); Daniel may want specific stills.
- Feature flags (decision 027), all off: grain 6 % multiply at 12 fps; media lean 6 px and scale 1.02; cursor dot 12 px, ring 40 px, paper dot on the footer, ink ring on the hero, links lean up to 10 px.
- Hero claim on phones (decision 028): the three sentences rise and leave as three blocks, not as five visual lines.
- Phase 5 moves (decision 024): on phones the claim fades out within the first half of the hero and briefly crosses the shrinking logo; the email in Contact now carries the accent stripe.

## Open items

Tracked from `CLAUDE.md` §17.

- Archia web license (Dmytro/Daniel). Not blocking, the site is built with Mont only until decided.
- Logo move on a real iPhone (Safari URL bar collapse, momentum scroll) and on Android Chrome. Dmytro, by hand.
- Projects still undecided in Daniel's document: bukovansky-mlyn.cz, Dykka, Mamelu, Vars.
- RTR Projects: name read from the logo, confirm the spelling. All 18 clients, Creditas included, approved for display by Dmytro on 2026-09-13.
- Project media: video ratios vary (two square, two ultra wide) and are cropped to 16:9.
- Company LinkedIn URL for the footer "LinkedIn." link (personal emails and LinkedIn delivered 2026-09-13). If there is no company page, decide what the link points to.
- ImageKit private key was shared in a chat session: Dmytro rotates it and updates `.env.local`.
- Favicon: "h" or the full wordmark (Daniel).
- Type scale confirmation on the live site (Daniel).
- Feature flag decisions (Daniel, after Phase 7).
- `docs/hardart-web.md` §4.03 spells the name `DIMITRO`; the site uses `DMYTRO`. Dmytro sends a corrected spec.
