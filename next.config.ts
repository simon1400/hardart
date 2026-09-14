import type { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import { featureBuild } from './lib/features'

export default function config(phase: string): NextConfig {
  const flags = featureBuild(process.env.HARDART_FLAGS)
  return {
    output: 'export',
    reactStrictMode: true,
    trailingSlash: false,
    images: { unoptimized: true },
    // Feature flags as build constants (lib/features.ts).
    env: flags.env,
    turbopack: { resolveAlias: flags.resolveAlias },
    // `*.dev.tsx` pages (app/dev/) exist only under `next dev` and are never exported.
    pageExtensions: phase === PHASE_DEVELOPMENT_SERVER ? ['tsx', 'ts', 'dev.tsx'] : ['tsx', 'ts'],
    experimental: {
      optimizePackageImports: ['gsap'],
    },
  }
}
