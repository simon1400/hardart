import localFont from 'next/font/local'

// Mont only. Archia is not used for now, labels use Mont Book (CLAUDE.md §5 fallback).
// Mont's weight classes are shifted: Book is 500, Bold is 800. Display type is Bold (Daniel's XD).
export const mont = localFont({
  src: [
    { path: './mont-book.woff2', weight: '500', style: 'normal' },
    { path: './mont-bold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-mont',
  display: 'swap',
  preload: true,
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
  adjustFontFallback: 'Arial',
})
