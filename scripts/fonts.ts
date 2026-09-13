// Converts the licensed Mont OTF sources to subset woff2 files for next/font/local.
// Run once after the sources change: pnpm fonts
// Sources live in font/Mont Family/ (gitignored). Output goes to app/fonts/ (committed).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import subsetFont from 'subset-font'

const SOURCE_DIR = 'font/Mont Family'
const OUT_DIR = 'app/fonts'

// Mont's OS/2 weight classes are shifted: Book is 500, Heavy is 900.
const FACES = [
  { source: 'Fontfabric - Mont Book.otf', out: 'mont-book.woff2' },
  { source: 'Fontfabric - Mont Heavy.otf', out: 'mont-heavy.woff2' },
]

// Latin + Latin-1 Supplement + Latin Extended-A, general punctuation, currency.
const RANGES: [number, number][] = [
  [0x0020, 0x007e],
  [0x00a0, 0x017f],
  [0x2000, 0x206f],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
]

const text = RANGES.flatMap(([from, to]) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)),
).join('')

mkdirSync(OUT_DIR, { recursive: true })

for (const face of FACES) {
  const input = readFileSync(join(SOURCE_DIR, face.source))
  const output = await subsetFont(input, text, { targetFormat: 'woff2' })
  writeFileSync(join(OUT_DIR, face.out), output)
  console.log(
    `${face.out}  ${(input.length / 1024).toFixed(0)} KB -> ${(output.length / 1024).toFixed(0)} KB`,
  )
}
