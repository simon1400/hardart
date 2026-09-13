import { ScrollLogo } from '@/components/motion/ScrollLogo'
import { Clients } from '@/components/sections/Clients'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { WhatWeDo } from '@/components/sections/WhatWeDo'
import { WhoWeAre } from '@/components/sections/WhoWeAre'
import { Work } from '@/components/sections/Work'

export default function Home() {
  return (
    <>
      <ScrollLogo />
      <main>
        <Hero />
        <WhoWeAre />
        <WhatWeDo />
        <Work />
        <Clients />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
