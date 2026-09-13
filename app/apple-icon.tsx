import { ImageResponse } from 'next/og'
import { palette, wordmark } from '@/lib/brand'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// The "h" of the wordmark on the accent ground. Favicon choice is still open with Daniel.
export default function AppleIcon() {
  const [h = ''] = wordmark.paths
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
      <svg width={80} height={110} viewBox="0 0 48.68 67" fill={palette.ink}>
        <path d={h} />
      </svg>
    </div>,
    size,
  )
}
