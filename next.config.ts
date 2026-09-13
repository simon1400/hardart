import type { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'

export default function config(phase: string): NextConfig {
  return {
    output: 'export',
    reactStrictMode: true,
    trailingSlash: false,
    images: { unoptimized: true },
    // `*.dev.tsx` pages (app/dev/) exist only under `next dev` and are never exported.
    pageExtensions: phase === PHASE_DEVELOPMENT_SERVER ? ['tsx', 'ts', 'dev.tsx'] : ['tsx', 'ts'],
    experimental: {
      optimizePackageImports: ['gsap'],
    },
  }
}
