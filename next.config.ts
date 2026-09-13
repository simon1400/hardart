import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: false,
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ['gsap'],
  },
}

export default nextConfig
