# Adding a project

Everything about a project lives in two places: one entry in `content/projects.ts` and one media folder named after the project.

## 1. Prepare the files

| File         | What                                                                            | Recommended                                              |
| ------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `video.mp4`  | the 16:9 media, loops muted, no sound ever                                      | 1920×1080, H.264, 8 to 20 s, no audio track, under 10 MB |
| `poster.jpg` | still shown before the video plays, required with a video                       | 1920×1080, the first frame of the video                  |
| `image.jpg`  | instead of a video, a still 16:9 image                                          | 1920×1080 or larger, same ratio                          |
| `site.jpg`   | optional, a full page screenshot of the website, scrolled inside the tall frame | 1000 to 1440 px wide, as tall as the page, jpg or webp   |

Frames have fixed shapes (16:9 and 9:16) and crop to fill, so exact sizes are not required, only the ratio matters for the 16:9 media. File names are free, they only have to match what you write in step 3. Allowed extensions: mp4, jpg, jpeg, png, webp, avif.

Full page screenshot tip: Chrome DevTools, device toolbar at 1440 wide, menu (⋮) → _Capture full size screenshot_.

## 2. Put them in a folder

```
public/projects/<slug>/video.mp4
public/projects/<slug>/poster.jpg
public/projects/<slug>/site.jpg
```

`<slug>` is lowercase letters, digits and dashes, for example `burger-street-festival`. This folder is ignored by git (videos are too big), it is for local preview.

For the live site upload the same tree to ImageKit: `/projects/<slug>/video.mp4` and so on. The build uses ImageKit when `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is set and resizes and compresses automatically.

## 3. Add the entry

In `content/projects.ts`, copy the template inside `data` above the placeholders:

```ts
{
  slug: 'burger-street-festival',
  name: 'Burger Street Festival',
  url: 'https://burgerstreetfestival.cz', // optional
  video: 'video.mp4',
  poster: 'poster.jpg',
  site: 'site.jpg', // optional
  tags: ['BRAND', 'CUSTOM CMS', 'DEVELOP', 'APP'],
  text: 'One to two sentences that say what was built, not only how it looks.',
},
```

Rules the build checks:

- `tags`: 2 to 4, at least one from the design set (`BRAND`, `ART DIRECTION`, `UX`, `UI`, `COPY`, `CAMPAIGN`) and at least one from the engineering set (`NEXT.JS`, `HEADLESS CMS`, `CUSTOM CMS`, `E-COMMERCE`, `MOTION`, `AI`, `INTEGRATIONS`, `INFRASTRUCTURE`, `DEVELOP`, `APP`). A new tag has to be added to one of the sets first.
- `text`: at most 240 characters, no em dash.
- `video` needs `poster`; use `video` or `image`, not both.
- `slug` must be unique.

Order in the file is the order on the page. Rows alternate sides automatically. A project without `site` gets a wider single column row.

When all real projects are in, delete the placeholder block. Production builds refuse to run while placeholders exist.

## 4. Check it

```
pnpm dev
```

Open http://localhost:3000. A file that is named in the entry but missing from the folder shows an empty grey frame, and `pnpm build` prints `check-content: missing public/projects/...`.

# Adding a client logo

1. Export the logo as SVG on the shared 654×368 artboard, black fill, and put it in `logo-partners/<name>.svg`.
2. Run `pnpm logos`. It writes the cleaned file to `public/clients/`.
3. Add `{ name: 'Client', file: '<name>.svg' }` to `content/clients.ts`, the order there is the marquee order.
