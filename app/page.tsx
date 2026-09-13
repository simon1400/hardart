import { RevealController } from '@/components/motion/RevealController'
import { ScrollLogo } from '@/components/motion/ScrollLogo'
import { Clients } from '@/components/sections/Clients'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { Statement } from '@/components/sections/Statement'
import { WhatWeDo } from '@/components/sections/WhatWeDo'
import { WhoWeAre } from '@/components/sections/WhoWeAre'
import { Work } from '@/components/sections/Work'

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
        <Statement />
        <WhatWeDo />
        <Contact />
      </main>
      <Footer />
      <RevealController />
    </>
  )
}
