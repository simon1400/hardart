import { ImageResponse } from 'next/og'
import { palette, wordmark } from '@/lib/brand'
import { site } from '@/content/site'

export const dynamic = 'force-static'
export const alt = site.brand.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  const width = 880
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: palette.accent,
      }}
    >
      <svg
        width={width}
        height={Math.round(width / wordmark.aspect)}
        viewBox={wordmark.viewBox}
        fill={palette.ink}
      >
        {wordmark.paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>,
    size,
  )
}
