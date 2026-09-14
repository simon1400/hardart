import { Cursor } from '@/components/flags/Cursor'
import { MediaHover } from '@/components/flags/MediaHover'
import { FooterCover } from '@/components/motion/FooterCover'
import { RevealController } from '@/components/motion/RevealController'
import { ScrollLogo } from '@/components/motion/ScrollLogo'
import { Clients } from '@/components/sections/Clients'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { Statement } from '@/components/sections/Statement'
import { WhoWeAre } from '@/components/sections/WhoWeAre'
import { Work } from '@/components/sections/Work'
import { features } from '@/lib/features'

// Section order follows Daniel's XD (docs/decisions.md 012).
export default function Home() {
  return (
    <>
      <ScrollLogo />
      <main>
        <Hero />
        <WhoWeAre />
        <Clients />
        <Work />
      </main>
      {/* The statement sticks while the footer slides over it (Statement.tsx), for the covered part
          only: the track ends there, so a footer taller than the screen (phones) takes it along. */}
      <div className="finale">
        <div className="statement-track">
          <Statement />
        </div>
        <Footer />
      </div>
      <FooterCover />
      <RevealController />
      {/* Extras beyond the spec, off by default (lib/features.ts). */}
      {features.mediaHover ? <MediaHover /> : null}
      {features.cursor ? <Cursor /> : null}
    </>
  )
}
