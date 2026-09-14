// Uploads the prepared project media to ImageKit, after pnpm media: pnpm media:upload
//
//   public/projects/<slug>/video.mp4    ->  ImageKit /projects/<slug>/video.mp4
//   public/projects/<slug>/poster.webp  ->  ImageKit /projects/<slug>/poster.webp   and so on
//
// Images go up in full size only, ImageKit resizes them. Videos go up in both encoded sizes
// (video.mp4, video-800.mp4), because the site serves them untouched (lib/imagekit.ts). A file whose size already matches the uploaded one is skipped, so a
// re-run only sends new or changed media. The private key comes from .env.local
// (IMAGEKIT_PRIVATE_KEY) and is never needed by the site itself.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'public/projects'
const API = 'https://api.imagekit.io/v1/files'
const UPLOAD = 'https://upload.imagekit.io/api/v1/files/upload'
const PURGE = 'https://api.imagekit.io/v1/files/purge'
const VARIANT = /-\d+\.\w+$/
const MEDIA = /\.(mp4|webp|jpe?g|png|avif)$/i

if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const key = process.env.IMAGEKIT_PRIVATE_KEY
if (!key) {
  console.error('upload-media: IMAGEKIT_PRIVATE_KEY is missing (.env.local)')
  process.exit(1)
}
const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, '')
const auth = `Basic ${Buffer.from(`${key}:`).toString('base64')}`
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

type Remote = { name: string; size: number; type: string }

async function remoteSizes(folder: string) {
  const response = await fetch(`${API}?path=${encodeURIComponent(folder)}&limit=1000`, {
    headers: { Authorization: auth },
  })
  if (!response.ok) throw new Error(`list ${folder}: ${response.status} ${await response.text()}`)
  const files = (await response.json()) as Remote[]
  return new Map(files.filter((f) => f.type === 'file').map((f) => [f.name, f.size]))
}

async function upload(path: string, folder: string, name: string) {
  const form = new FormData()
  form.append('file', new Blob([readFileSync(path)]), name)
  form.append('fileName', name)
  form.append('folder', folder)
  form.append('useUniqueFileName', 'false')
  form.append('overwriteFile', 'true')
  const response = await fetch(UPLOAD, {
    method: 'POST',
    headers: { Authorization: auth },
    body: form,
  })
  if (!response.ok) throw new Error(`upload ${path}: ${response.status} ${await response.text()}`)
}

// An overwritten file keeps its URL, so the CDN would go on serving the old one (and its
// transformations) until the cache expires.
async function purge(path: string) {
  if (!endpoint)
    return console.warn(`  not purged, NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is missing: ${path}`)
  const response = await fetch(PURGE, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: `${endpoint}${path}` }),
  })
  if (!response.ok) throw new Error(`purge ${path}: ${response.status} ${await response.text()}`)
}

let sent = 0
let skipped = 0
for (const slug of readdirSync(DIR).sort()) {
  const local = join(DIR, slug)
  if (!statSync(local).isDirectory()) continue
  const folder = `/projects/${slug}`
  const remote = await remoteSizes(folder)
  for (const name of readdirSync(local).sort()) {
    if (!MEDIA.test(name) || (VARIANT.test(name) && !name.endsWith('.mp4'))) continue
    const path = join(local, name)
    const { size } = statSync(path)
    if (remote.get(name) === size) {
      skipped++
      continue
    }
    await upload(path, folder, name)
    if (remote.has(name)) await purge(`${folder}/${name}`)
    console.log(`  ${folder}/${name}  ${mb(size)}`)
    sent++
  }
}
console.log(`upload-media: ${sent} uploaded, ${skipped} unchanged`)
