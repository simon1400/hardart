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
| video      | 16:9 plays best (other ratios are cropped to fill), H.264 mp4, 8 to 25 s, no audio track, under 10 MB                                              |
| screenshot | as tall as the page, any width (it is resized to 1000 px). Chrome DevTools: device toolbar at 1440 wide, menu (⋮) → _Capture full size screenshot_ |

## 2. Run `pnpm media`

It writes `public/projects/<slug>/video.mp4` and `public/projects/<slug>/site.webp` (screenshots shrink from megabytes to a few hundred KB). The screenshot then scrolls by itself inside the tall frame, at the same slow speed for every site.

For the live site upload the resulting `public/projects/` tree to ImageKit as `/projects/<slug>/...`. The build uses ImageKit when `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is set.

Still images instead of a video: put `image.jpg` into `public/projects/<slug>/` by hand and use `image: 'image.jpg'`. An optional `poster.jpg` shown before a video loads works the same way.

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
  site: 'site.webp',                  // optional
  text: 'One to two sentences: what it is, then what we did.',
  tags: ['BRAND', 'DESIGN', 'CUSTOM SYSTEMS', 'EMAIL'],
},

// secondary: the same without video, image, poster and site
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

Open http://localhost:3000. A file that is named in the entry but missing from the folder shows an empty grey frame, and `pnpm build` prints `check-content: missing public/projects/...`.

# Adding a client logo

1. Export the logo as SVG on the shared 654×368 artboard, black fill, and put it in `logo-partners/<name>.svg`.
2. Run `pnpm logos`. It writes the cleaned file to `public/clients/`.
3. Add `{ name: 'Client', file: '<name>.svg' }` to `content/clients.ts`, the order there is the marquee order.
