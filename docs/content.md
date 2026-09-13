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

In `content/projects.ts`, copy the template inside `data` above the placeholders:

```ts
{
  slug: 'burgerstreetfestival',
  name: 'Burger Street Festival',
  url: 'https://burgerstreetfestival.cz', // optional
  video: 'video.mp4',
  site: 'site.webp', // optional
  tags: ['BRAND', 'CUSTOM CMS', 'DEVELOP', 'APP'],
  text: 'One to two sentences that say what was built, not only how it looks.',
},
```

Rules the build checks:

- `tags`: 2 to 4, at least one from the design set (`BRAND`, `ART DIRECTION`, `UX`, `UI`, `COPY`, `CAMPAIGN`) and at least one from the engineering set (`NEXT.JS`, `HEADLESS CMS`, `CUSTOM CMS`, `E-COMMERCE`, `MOTION`, `AI`, `INTEGRATIONS`, `INFRASTRUCTURE`, `DEVELOP`, `APP`). A new tag has to be added to one of the sets first.
- `text`: at most 240 characters, no em dash.
- use `video` or `image`, not both.
- `slug` must be unique.

Order in the file is the order on the page. Rows alternate sides automatically. A project without `site` gets a wider single column row.

Entries marked `draft: true` are allowed locally; remove the flag once name, url, tags and text are final. Production builds refuse drafts.

## 4. Check it

```
pnpm dev
```

Open http://localhost:3000. A file that is named in the entry but missing from the folder shows an empty grey frame, and `pnpm build` prints `check-content: missing public/projects/...`.

# Adding a client logo

1. Export the logo as SVG on the shared 654×368 artboard, black fill, and put it in `logo-partners/<name>.svg`.
2. Run `pnpm logos`. It writes the cleaned file to `public/clients/`.
3. Add `{ name: 'Client', file: '<name>.svg' }` to `content/clients.ts`, the order there is the marquee order.
