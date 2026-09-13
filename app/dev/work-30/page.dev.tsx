import type { Metadata } from 'next'
import { RevealController } from '@/components/motion/RevealController'
import { Work } from '@/components/sections/Work'
import { featured } from '@/content/projects'

// Dev only stress page (Phase 6): the Work list with 30 featured rows cycling through the real
// projects, to check the video cap, unloading and CLS on a long list. The .dev.tsx extension is a
// page only under `next dev` (next.config.ts), so it never reaches the export.

export const metadata: Metadata = { title: 'work-30 (dev)', robots: { index: false } }

const ROWS = 30

export default function WorkStress() {
  const rows = Array.from({ length: ROWS }, (_, i) => featured[i % featured.length]).filter(
    (project) => project !== undefined,
  )
  return (
    <>
      <main>
        <Work featured={rows} secondary={[]} />
      </main>
      <RevealController />
    </>
  )
}
