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

## Current state (2026-09-13)

Built: static page (phase 2) with Daniel's XD layout, clients marquee, project media pipeline
(`pnpm media`), self scrolling website screenshots, Lenis + GSAP motion core with line reveals
(phase 3), scroll logo move from hero to corner turning ink to accent (phase 4), Daniel's project
copy with 9 featured rows and 5 secondary projects as a typographic index with a scroll drawn
marker. Motion architecture: sections mark elements with `RevealLines`/`Reveal` (`data-reveal`),
`components/motion/RevealController.tsx` sets them up (decision 016). Phase 5 (decision 024): word
swap, media window reveal and website frame parallax, hero claim exit, scroll drawn accent stripes,
statement halves sliding in, footer curtain; scroll scenes live in `components/motion/scenes.ts`.

Parked questions (do not ask again unless a phase is blocked by one; they live in
`docs/decisions.md` under "To confirm with Dan" and "Open items"): featured order, tag unification,
undecided projects (bukovansky-mlyn.cz, Dykka, Mamelu, Vars), `hardart-copy.md` not delivered,
company LinkedIn, ImageKit account, iPhone and Android check, What we do and Contact not designed in
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

### Phase 6, media pipeline. Status: todo

- At most 3 videos playing at once (a shared controller for `ProjectVideo`), unload sources far from
  the viewport, posters, ImageKit transformation presets checked in `lib/imagekit.ts`.
- Dev only stress page with 30 projects (`/dev/work-30`, excluded from the export).
- Done when: with 30 videos no more than 3 play, no media requests for rows far below the fold,
  CLS 0, a full mobile scroll uses 15 MB or less.
- Learned in Phase 5: at 6x CPU the motion alone holds 60 fps, but the work rows drop about 20
  frames (33 to 67 ms) while videos start and the website screenshots decode. Measure the same
  wheel scroll (rAF frame times) before and after; candidates: posters, `decode()` of the screenshot
  before its frame opens, starting playback after the media reveal finishes.
- Media now sits inside `.media-reveal > .media-reveal-inner` (decision 024); the video controller
  must not add transforms to those layers.

### Phase 7, feature flags. Status: todo

- `heroGrain`, `mediaHover`, `cursor` per CLAUDE.md §10, each isolated in `components/flags/`, off by
  default, zero bytes when off (check the bundle).
- Done when: each flag works alone, all three together do not conflict, performance with all on is
  still 60 fps, reduced motion disables all three.
- `mediaHover` must move a different element than the Phase 5 layers: the website frame already has
  a scroll parallax (`data-parallax`, yPercent) and the reveal layers are cleared after the reveal.
- The chrome-devtools MCP was locked by a Chrome left over from an earlier session; Phase 5 used the
  Playwright MCP with a CDP session (`Emulation.setCPUThrottlingRate`) for the 6x measurement.

### Phase 8, hardening. Status: todo

- CSP and security headers in `nginx/hardart.cz.conf` (self, ImageKit, Umami).
- Lighthouse CI in `ci.yml` with the budgets from CLAUDE.md §14 (JS ceiling 300 KB gzip).
- Linux visual baselines generated in CI so `@visual` runs there too (decision 010).
- README: setup, `pnpm media`, `pnpm logos`, how Daniel's deliveries get in.
- Done when: CI enforces everything in CLAUDE.md §14 and is green.

### Phase 9, deploy. Status: todo

- `deploy.yml` (push to `main` builds on the VPS and syncs `out/`, `HARDART_ENV=production`),
  reference Nginx config applied by Dmytro, TLS, `www` redirect, optional basic auth, Umami on the VPS.
- Needs from Dmytro: VPS secrets in GitHub, Umami host, decision on basic auth. Ask at the start.
- Done when: a push to `main` updates hardart.cz within 3 minutes, Umami counts a view, headers
  verified with `curl -I`, securityheaders.com grade A.

### Phase 10, content and launch. Status: todo

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
