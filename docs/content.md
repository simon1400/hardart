# Adding a project

Everything about a project lives in two places: one entry in `content/projects.ts` and one media folder named after the project.

## 1. Drop the raw files into `projects/`

```
projects/<slug>.mp4   the 16:9 video
projects/<slug>.png   the full page screenshot of the website (optional, jpg or webp also fine)
```

`<slug>` is lowercase letters, digits and dashes, for example `ducati`. The folder is ignored by git.

| What       | Recommended                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| video      | 16:9 plays best (other ratios are cropped to 16:9), mp4, 8 to 25 s, at least 1600 px wide if possible; size and audio do not matter                |
| screenshot | as tall as the page, any width (it is resized to 1000 px). Chrome DevTools: device toolbar at 1440 wide, menu (⋮) → _Capture full size screenshot_ |

## 2. Run `pnpm media`

It writes into `public/projects/<slug>/`:

| File                             | What                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `video.mp4`, `video-800.mp4`     | the video in its own aspect ratio (never cropped), no sound, up to 1600 px wide, and a small copy for phones |
| `poster.webp`, `poster-800.webp` | a still from the first seconds (skipping black or white intros), shown before playback and without motion    |
| `site.webp`, `site-600.webp`     | the screenshot at 1000 px and 600 px wide                                                                    |

The first run downloads ffmpeg once. Only new or changed deliveries are processed; `pnpm media --force` redoes everything. A video usually shrinks from 5 to 10 MB to 1 to 4 MB (phones: under 2 MB). If a poster shows the wrong moment, replace `poster.webp` and `poster-800.webp` by hand.

## 2b. Run `pnpm media:upload`

It sends the new or changed files to ImageKit (`/projects/<slug>/...`), which serves them on the live site and in local builds. It needs `IMAGEKIT_PRIVATE_KEY` in `.env.local` (see `.env.example`). Images go up in full size only, ImageKit resizes them; videos go up in both sizes and are served exactly as `pnpm media` encoded them. Without `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` the build serves `public/projects/` instead.

Still images instead of a video: put `image.jpg` (and optionally `image-800.jpg` for phones) into `public/projects/<slug>/` by hand and use `image: 'image.jpg'`. A different poster file can be named with `poster: '...'`.

## 3. Add the entry

The copy source is `docs/hardart-projects.md`. There are two lists in `content/projects.ts`:

- `featuredData`: projects with media. Big rows with video, optional website screenshot, title, text and tags.
- `secondaryData`: projects without media. They continue the list as a typographic index (title left, text and tags right) and their titles get the accent marker drawn by scroll.

```ts
// featured
{
  slug: 'burgerstreetfestival',       // media folder
  client: 'burgerstreetfestival.cz',  // never shown, describes the media for screen readers
  title: "CZECHIA'S BIGGEST FOOD FESTIVAL",
  url: 'https://burgerstreetfestival.cz/', // optional
  video: 'video.mp4',                 // or image: 'image.jpg'
  width: 1080,                        // pixel size `pnpm media` prints (for an image: its size);
  height: 1080,                       // the frame takes this aspect ratio, nothing is cropped
  site: 'site.webp',                  // optional; projects without it sit two to a row
  text: 'One to two sentences: what it is, then what we did.',
  tags: ['BRAND', 'DESIGN', 'CUSTOM SYSTEMS', 'EMAIL'],
},

// secondary: the same without video, image, poster, width, height and site
```

Rules the build checks:

- `title`: 20 to 40 characters (set uppercase on the page).
- `tags`: 2 to 4, each from `TAGS` at the top of the file. A new tag has to be added there first.
- `text`: at most 240 characters, no em dash.
- featured: `video` or `image`, not both, one of them required. Secondary: no media fields.
- `slug` must be unique across both lists.

Order in each list is the order on the page. Featured rows alternate sides automatically. A featured project without `site` gets a wider single column row.

Entries marked `draft: true` are allowed locally; remove the flag once title, url, tags and text are final. Production builds refuse drafts.

## 4. Check it

```
pnpm dev
```

Open http://localhost:3000. Without the ImageKit endpoint, a file that is named in the entry but missing from the folder shows an empty grey frame, and `pnpm build` prints `check-content: missing public/projects/...`. With ImageKit, a file that was not uploaded shows a broken image, so run `pnpm media:upload` first.

# Adding a client logo

1. Export the logo as SVG on the shared 654×368 artboard, black fill, and put it in `logo-partners/<name>.svg`.
2. Run `pnpm logos`. It writes the cleaned file to `public/clients/`.
3. Add `{ name: 'Client', file: '<name>.svg' }` to `content/clients.ts`, the order there is the marquee order.
