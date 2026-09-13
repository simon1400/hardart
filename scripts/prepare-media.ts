// Prepares raw project deliveries for the site.
// Run after dropping files into projects/: pnpm media
//
//   projects/<slug>.mp4   16:9 video          ->  public/projects/<slug>/video.mp4   (copied as is)
//   projects/<slug>.png   full page screenshot ->  public/projects/<slug>/site.webp   (1000px wide)
//   projects/<slug>.jpg   same, jpg/webp also accepted
//
// projects/ and public/projects/ are gitignored; production serves the same tree from ImageKit.
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { extname, join, parse } from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'projects'
const OUT_DIR = 'public/projects'
const SITE_WIDTH = 1000 // the tall frame is at most ~520px wide, so 2x

const screenshotExt = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

if (!existsSync(SOURCE_DIR)) {
  console.error(`prepare-media: ${SOURCE_DIR}/ not found`)
  process.exit(1)
}

for (const file of readdirSync(SOURCE_DIR).sort()) {
  const source = join(SOURCE_DIR, file)
  const { name, ext } = parse(file)
  const slug = name.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  const dir = join(OUT_DIR, slug)
  mkdirSync(dir, { recursive: true })

  if (extname(file).toLowerCase() === '.mp4') {
    const target = join(dir, 'video.mp4')
    copyFileSync(source, target)
    const size = statSync(target).size
    console.log(
      `${slug}/video.mp4  ${mb(size)}${size > 10 * 1024 * 1024 ? '  (over 10 MB, consider compressing)' : ''}`,
    )
  } else if (screenshotExt.has(ext.toLowerCase())) {
    const target = join(dir, 'site.webp')
    const image = sharp(source, { limitInputPixels: false })
    const { width = 0 } = await image.metadata()
    const info = await image
      .resize({ width: Math.min(width, SITE_WIDTH), withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(target)
    console.log(
      `${slug}/site.webp  ${info.width}x${info.height}  ${mb(statSync(source).size)} -> ${mb(info.size)}`,
    )
  } else {
    console.warn(`skip ${file}`)
  }
}
