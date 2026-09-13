import localFont from 'next/font/local'

// Mont only. Archia is not used for now, labels use Mont Book (CLAUDE.md §5 fallback).
// Mont's weight classes are shifted: Book is 500, Heavy is 900.
export const mont = localFont({
  src: [
    { path: './mont-book.woff2', weight: '500', style: 'normal' },
    { path: './mont-heavy.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-mont',
  display: 'swap',
  preload: true,
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
  adjustFontFallback: 'Arial',
})
