import { ImageResponse } from 'next/og'
import { palette } from '@/lib/brand'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Daniel's favicon (2026-09-14): the "h" hangs from the top edge of the accent ground. iOS rounds
// the corners itself, so the square has none.
const H_PATH =
  'M1147.138,880.7v698.812H747.406V927.122c0-133.81-47.038-202.058-151.319-202.058-120.966,0-196.355,85.829-196.355,234.768v619.676H0V0H399.732V495.387c85.451-68.79,194.116-110.644,309.779-110.644,266.417,0,437.627,195.153,437.627,495.953'

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: palette.accent }}>
      <svg width={180} height={180} viewBox="0 0 1920 1920">
        <path d={H_PATH} transform="translate(389.988 0)" fill="#001914" />
      </svg>
    </div>,
    size,
  )
}
