# Session handoff

Dmytro starts every new session with something like "continue from docs/sessions.md". Do exactly
this:

1. Read `CLAUDE.md`, `docs/hardart-web.md`, `docs/hardart-projects.md`, `docs/decisions.md`,
   `docs/content.md` and your project memory.
2. Find the first phase below whose status is not `done`. That is the whole task of the session.
3. Work through it, then finish with the end of session steps at the bottom.

One phase per session. Do not start the next one, even if time is left; propose it in the report.

## Standing rules (short version, details in CLAUDE.md and memory)

- Work directly in `main`, no branches or PRs. Conventional commits. Before every commit:
  `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`. After every push
  wait for CI (`gh run watch`) and fix it if red.
- Visual baselines change only in a separate commit `visual: …`. They are win32 only; CI skips
  `@visual`. `--update-snapshots` does not rewrite a baseline whose change is within the pixel
  threshold: delete the file first when a small element changed.
- Check in the browser with the chrome-devtools MCP at 1440, 820 and 390 (mobile, touch). Serve the
  build with `pnpm exec serve out -l 4320 --no-clipboard` in the background and stop it at the end.
- Motion has no limits except: text readable without motion, 60 fps at 6x CPU slowdown (measure it),
  reduced motion and `?motion=off` respected, loops paused off screen. The goal is wow. Propose moves
  proactively, but show Dmytro the list of moves before building a big set.
- JS budget: as small as reasonable, never at the cost of features; ceiling 300 KB gzip.
- Copy is never invented or paraphrased. Project copy comes from `docs/hardart-projects.md`.
- Daniel's new files arrive in `C:\Users\dpechunka\Downloads\Telegram Desktop\`.
- Every non-obvious technical decision gets an entry in `docs/decisions.md`.
- Communicate with Dmytro in Russian; code, comments, commits and docs in English.

## Current state (2026-09-14, after Phase 8)

Built: static page (phase 2) with Daniel's XD layout, clients marquee, project media pipeline
(`pnpm media`), self scrolling website screenshots, Lenis + GSAP motion core with line reveals
(phase 3), scroll logo move from hero to corner turning ink to accent (phase 4), Daniel's project
copy with 9 featured rows and 5 secondary projects as a typographic index with a scroll drawn
marker. Motion architecture: sections mark elements with `RevealLines`/`Reveal` (`data-reveal`),
`components/motion/RevealController.tsx` sets them up (decision 016). Phase 5 (decision 024): word
swap, media window reveal and website frame parallax, hero claim exit, scroll drawn accent stripes,
statement halves sliding in, footer curtain; scroll scenes live in `components/motion/scenes.ts`.
Phase 6 (decision 025): `pnpm media` transcodes videos with ffmpeg-static (16:9, 1600 and 800 px),
makes posters and phone sizes; one video controller (`components/media/videoController.ts`) attaches
near the viewport, unloads far away and plays at most 3; posters are lazy images under the video;
dev only stress page `/dev/work-30` (`page.dev.tsx`, run `pnpm dev`).
Phase 7 (decision 027): feature flags `heroGrain`, `mediaHover`, `cursor` in `components/flags/`, all
off; one boolean each in `lib/features.ts` (`featureDefaults`), `HARDART_FLAGS=all` (or names) turns
them on for a build; disabled flag modules are aliased to `Off.tsx` and ship zero bytes.
Phase 8 (decision 028): every exported HTML gets a meta CSP with inline script hashes (`scripts/csp.ts`
after `next build`, policy in `lib/security.ts`); `nginx/hardart.cz.conf` plus `nginx/hardart-headers.conf`
are the reference server config with security headers. CI runs the JS budget (`pnpm check-budget`),
Lighthouse CI (`lighthouserc.json`, 2x CPU on runners) and visual tests against linux baselines
(`visual-baselines.yml`, manual). The hero claim reveals in CSS on the compositor once Mont is loaded
(head script adds `fonts-ready`), is no longer split, and reveal setup runs in 12 ms slices. The static
hero wordmark is an `<img>` (ink SVG data URI), which is the LCP element on every platform. Umami
script renders with `NEXT_PUBLIC_UMAMI_HOST` and `NEXT_PUBLIC_UMAMI_ID`. README exists.

Parked questions (do not ask again unless a phase is blocked by one; they live in
`docs/decisions.md` under "To confirm with Dan" and "Open items"): featured order, tag unification,
undecided projects (bukovansky-mlyn.cz, Dykka, Mamelu, Vars), `hardart-copy.md` not delivered,
company LinkedIn, ImageKit private key rotation (Dmytro), iPhone and Android check, What we do and Contact not designed in
the XD.

## Phases

### Phase 5, section motion. Status: done (2026-09-13)

Built everything in the list below except the scroll velocity marquee (Dmytro chose reveal only).
Not built from the proposals: What we do entrance beyond the line reveals.

- D. Word swap in the Statement (`components/motion/WordSwap.tsx`, slot in
  `components/sections/Statement.tsx`): options stacked in one inline grid cell so the line width
  never changes; loop only while visible; `MEETINGS` without motion; screen readers get the sentence
  once (already in markup).
- E. Work rows: media reveal with impact (for example a clip or mask opening plus scale settling,
  light parallax on the website frame); must not fight the self scrolling screenshot (it runs a CSS
  transform on the image, animate a wrapper instead).
- F. Clients: reveal, optionally marquee reacting to scroll velocity.
- Further wow proposals: hero claim parallax or exit as the hero leaves, footer entrance, What we do
  and Contact entrances. First send Dmytro a short list of proposed moves, then build the approved
  ones.
- Done when: swap width constant across all words (Playwright bounding box assertion), swap pauses
  off screen (assertion), reduced motion shows static `MEETINGS`, every new move has a motion test
  and a reduced motion check, 60 fps at 6x CPU through the whole page, visual baselines updated.

### Phase 6, media pipeline. Status: done (2026-09-13)

- Built: transcoding and posters in `pnpm media`, phone sizes, shared video controller with the cap
  of 3, unloading beyond 3 viewports, lazy poster images, `/dev/work-30`, `tests/media.spec.ts`.
- Measured (decision 025): 0 frames over 20 ms at 6x CPU through the whole page with videos playing,
  full mobile scroll 9.2 MB, CLS 0, no media requests on the first screen, JS 226 KB gzip.

### Phase 7, feature flags. Status: done (2026-09-14)

- Built: the three flags per CLAUDE.md §10, build constants plus module aliases (zero bytes verified by
  grepping `out/`), `tests/flags.spec.ts`, a second CI build with `HARDART_FLAGS=all`.
- Measured (decision 027): all flags on at 6x CPU equal to the default build (16 and 19 frames over
  20 ms of about 845, p95 16.8 ms); JS 227.4 KB gzip with all on, 225.0 KB off.
- Waiting on Daniel: which flags go live (open item).

### Phase 8, hardening. Status: done (2026-09-14)

- Built: CSP meta with hashes plus Nginx header policy and security headers, full reference Nginx
  config, Umami script by env, Lighthouse CI and JS budget in CI, linux visual baselines, security
  tests, README. LCP budget raised to 3.0 s by Dmytro (1.5 s is out of reach without cutting motion).
- Fixed on the way: hero claim waited for the JS bundle (LCP), font swap shifted the claim (CLS),
  collapsed negative margins made split paragraphs taller than unsplit ones, the font wait rejected
  at once where Arial is missing (Linux, Android), one 275 ms setup task (TBT).
- Measured (decision 028): CI Performance 0.98, LCP 2.4 s, TBT 10 ms, CLS 0, other categories
  100; locally Performance 95, LCP 2.9 s, TBT 10 to 20 ms; JS 225.7 KiB gzip; load and scroll frames
  at 6x CPU equal to the Phase 7 build.
- Note: `pnpm lighthouse` locally (4x CPU) sits at the LCP limit, about 3.0 s simulated, while CI
  (2x CPU on half as fast runners) gives 2.4 s; trust CI, the local number is Lantern noise on localhost.

Original plan:

- CSP and security headers in `nginx/hardart.cz.conf` (self, ImageKit, Umami).
- Lighthouse CI in `ci.yml` with the budgets from CLAUDE.md §14 (JS ceiling 300 KB gzip).
- Linux visual baselines generated in CI so `@visual` runs there too (decision 010).
- README: setup, `pnpm media`, `pnpm logos`, how Daniel's deliveries get in.
- CSP: ImageKit serves video and poster (`media-src`, `img-src`); `/dev/` never ships (Phase 6).
- Done when: CI enforces everything in CLAUDE.md §14 and is green.
- Performance measurements: run Chromium headless on the GPU (`chromium.launch({ channel: 'chromium',
args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] })`). The default headless
  shell renders in SwiftShader and a visible window disturbs Dmytro and gives noisy numbers. Compare
  against a default build measured the same way, warm cache, several runs. Lighthouse runs should not
  open windows either.
- CSP: the grain flag needs nothing extra (WebGL, inline canvas); flags do not add third party hosts.

### Phase 9, deploy. Status: todo

- `deploy.yml` (push to `main` builds on the VPS and syncs `out/`, `HARDART_ENV=production`),
  reference Nginx config applied by Dmytro, TLS, `www` redirect, optional basic auth, Umami on the VPS.
- Needs from Dmytro: VPS secrets in GitHub, Umami host, decision on basic auth. Ask at the start.
- Dmytro (2026-09-14): Claude does the whole deploy itself, server side included (`ssh het`), following
  the barbitch and server-monitor pattern. Project memory `server-het` and `deploy-pattern` has the
  facts: shared prod server with priority sites (barbitch, burger, ddsirup, never touch them),
  Node 20 and no pnpm on the server (our build needs Node 24 and pnpm), 11 GB disk free, no brotli
  module, Umami not installed. `hardart.cz` has no A record and `www` does not exist yet (DNS at
  WEDOS). Proposal to confirm at the start: build in GitHub Actions and rsync `out/` into
  `/opt/hardart/releases/<sha>` with a `current` symlink, instead of building on the VPS.
- ImageKit is live (decision 026): the secret `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is set in GitHub,
  `deploy.yml` must pass it to the build. Media is uploaded with `pnpm media:upload`. CSP needs
  `ik.imagekit.io` in `img-src` and `media-src`.
- From Phase 8: the deploy must run `pnpm build` (it writes the CSP meta after `next build`), set
  `NEXT_PUBLIC_UMAMI_HOST` and `NEXT_PUBLIC_UMAMI_ID` for the build, and Dmytro installs
  `nginx/hardart-headers.conf` as `/etc/nginx/snippets/hardart-headers.conf` with `{{UMAMI_HOST}}`
  replaced (keep `tests/security.spec.ts` in sync: it compares the snippet with `headerPolicy()`).
  HSTS is on in the snippet, so enable it only once TLS works. rsync must not leave old `_next`
  chunks referenced by cached HTML (HTML is no-cache).
- Done when: a push to `main` updates hardart.cz within 3 minutes, Umami counts a view, headers
  verified with `curl -I`, securityheaders.com grade A.

### Phase 10, content and launch. Status: todo

- Flags go live by setting `featureDefaults.<name> = true` in `lib/features.ts`.
- Resolve the parked questions with Dmytro and Daniel, apply `hardart-copy.md` if delivered, final
  tags and projects, real device checks, feature flag decisions, remove basic auth.
- Done when: `check-content` passes with `HARDART_ENV=production` and Daniel signs off.

## End of session

1. All checks green, commits pushed, CI green.
2. Update this file: set the phase status to `done` (or `in progress` with what is left), refresh
   "Current state" and move anything learned into the phase notes of later phases.
3. Add decisions to `docs/decisions.md`, update memory if Dmytro gave new standing instructions.
4. Report to Dmytro in Russian: what was done, what was measured, what is needed from him, and the
   next phase.
