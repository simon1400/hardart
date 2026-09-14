// Prepares raw project deliveries for the site.
// Run after dropping files into projects/: pnpm media   (pnpm media --force redoes everything)
//
//   projects/<slug>.mp4   video               ->  public/projects/<slug>/video.mp4        up to 1600px wide
//                                                  public/projects/<slug>/video-800.mp4    phones
//                                                  public/projects/<slug>/poster.webp      a detailed early frame
//                                                  public/projects/<slug>/poster-800.webp
//   projects/<slug>.png   full page screenshot ->  public/projects/<slug>/site.webp       1000px wide
//                                                  public/projects/<slug>/site-600.webp   phones
//   projects/<slug>.jpg   same, jpg/webp also accepted
//
// Videos keep their aspect ratio (it prints the size to copy into content/projects.ts), lose their audio track, run at 30 fps at
// most and start playing before they finish downloading (faststart). The -800 and -600 files are
// the local stand-ins for the ImageKit width presets in lib/imagekit.ts; the files without a
// suffix are what gets uploaded to ImageKit.
//
// projects/ and public/projects/ are gitignored; production serves the same tree from ImageKit.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, parse } from 'node:path'
import sharp from 'sharp'
import { MOBILE_WIDTH, variant } from '../lib/imagekit'

const SOURCE_DIR = 'projects'
const OUT_DIR = 'public/projects'
const SITE_WIDTH = 1000 // the tall frame is at most ~520px wide, so 2x

/** Width, quality (x264 CRF) and a bitrate ceiling so busy footage cannot balloon. */
const VIDEO = [
  { file: 'video.mp4', width: 1600, crf: 26, maxrate: '2000k' },
  { file: variant('video.mp4', MOBILE_WIDTH.video), width: 800, crf: 28, maxrate: '800k' },
] as const
const POSTERS = [
  { file: 'poster.webp', width: 1600 },
  { file: variant('poster.webp', MOBILE_WIDTH.poster), width: 800 },
] as const
const SITES = [
  { file: 'site.webp', width: SITE_WIDTH },
  { file: variant('site.webp', MOBILE_WIDTH.site), width: MOBILE_WIDTH.site },
] as const

/** Seconds tried for the poster frame, and the image entropy that counts as a real picture. */
const POSTER_TIMES = [0, 0.5, 1, 1.5, 2, 3] as const
const DETAILED = 4

const force = process.argv.includes('--force')
const screenshotExt = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

/** ffmpeg-static downloads its binary in an install script, which pnpm skips so CI never fetches it. */
function ffmpeg(): string {
  const require = createRequire(import.meta.url)
  const path = require('ffmpeg-static') as string | null
  if (!path) throw new Error('prepare-media: ffmpeg-static has no binary for this platform')
  if (!existsSync(path)) {
    console.log('prepare-media: downloading ffmpeg (once)')
    execFileSync(process.execPath, [require.resolve('ffmpeg-static/install.js')], {
      stdio: 'inherit',
    })
  }
  return path
}

/** True when target exists and is newer than source, unless --force. */
function fresh(source: string, target: string) {
  return !force && existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs
}

function report(target: string, extra = '') {
  console.log(`  ${target.replace(`${OUT_DIR}/`, '')}  ${mb(statSync(target).size)}${extra}`)
}

/** One frame as PNG; empty past the end of the video. */
function frameAt(bin: string, video: string, time: number) {
  return execFileSync(
    bin,
    [
      ...['-hide_banner', '-loglevel', 'error', '-ss', String(time), '-i', video],
      ...['-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', '-'],
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  )
}

async function prepareVideo(source: string, dir: string) {
  const bin = ffmpeg()
  for (const { file, width, crf, maxrate } of VIDEO) {
    const target = join(dir, file)
    if (fresh(source, target)) continue
    // Never cropped: the frame takes the video's own aspect ratio (width and height in content).
    // x264 needs even sides.
    execFileSync(bin, [
      ...['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-an'],
      ...['-vf', `scale='trunc(min(${width},iw)/2)*2':-2,fps='min(30,source_fps)'`],
      ...['-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high'],
      ...['-maxrate', maxrate, '-bufsize', `${parseInt(maxrate, 10) * 2}k`],
      ...['-pix_fmt', 'yuv420p', '-movflags', '+faststart', target],
    ])
    report(target)
  }
  const size = await sharp(frameAt(bin, join(dir, 'video.mp4'), 0)).metadata()
  console.log(`  size  width: ${size.width}, height: ${size.height}`)

  // Poster: it is all that shows without motion, so not a flat intro frame (many videos fade in from
  // black or white). The first frame in the opening seconds with real detail, else the most detailed.
  const video = join(dir, 'video.mp4')
  const posters = POSTERS.filter(({ file }) => !fresh(video, join(dir, file)))
  if (posters.length === 0) return
  let frame: Buffer | undefined
  let best = -1
  for (const time of POSTER_TIMES) {
    const candidate = frameAt(bin, video, time)
    if (candidate.length === 0) break // past the end of a short video
    const { entropy } = await sharp(candidate).stats()
    if (entropy > best) {
      best = entropy
      frame = candidate
    }
    if (entropy >= DETAILED) break
  }
  if (!frame) throw new Error(`prepare-media: no frame in ${video}`)
  for (const { file, width } of posters) {
    const target = join(dir, file)
    await sharp(frame)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, effort: 5 })
      .toFile(target)
    report(target)
  }
}

async function prepareSite(source: string, dir: string) {
  for (const { file, width } of SITES) {
    const target = join(dir, file)
    if (fresh(source, target)) continue
    const info = await sharp(source, { limitInputPixels: false })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(target)
    report(target, `  ${info.width}x${info.height}`)
  }
}

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
  const kind = ext.toLowerCase()

  if (kind === '.mp4') {
    console.log(`${slug}: video ${mb(statSync(source).size)}`)
    await prepareVideo(source, dir)
  } else if (screenshotExt.has(kind)) {
    console.log(`${slug}: screenshot ${mb(statSync(source).size)}`)
    await prepareSite(source, dir)
  } else {
    console.warn(`skip ${file}`)
  }
}
