import type { Metadata } from 'next'
import { ScrollLogo } from '@/components/motion/ScrollLogo'
import { Link } from '@/components/ui/Link'
import { site } from '@/content/site'

export const metadata: Metadata = { title: site.notFound.title }

export default function NotFound() {
  return (
    <>
      <ScrollLogo />
      <main className="flex min-h-svh flex-col justify-end gap-6 px-gutter pb-gutter">
        <h1 className="text-claim">{site.notFound.text}</h1>
        <p className="text-body">
          <Link href="/">{site.notFound.link}</Link>
        </p>
      </main>
    </>
  )
}
