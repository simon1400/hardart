import { ScrollLogoMotion } from '@/components/motion/ScrollLogoMotion'
import { Wordmark } from '@/components/ui/Wordmark'
import { site } from '@/content/site'

// B. The one fixed wordmark. The link is always the small corner hit area; the mark inside it is
// what moves. Without motion (no JS, reduced motion, ?motion=off) the mark sits in the corner slot
// and shows once the hero wordmark has scrolled away. With motion, ScrollLogoMotion lays the mark
// over the hero wordmark and scrubs it into the slot.
export function ScrollLogo() {
  return (
    <header>
      <a href="#top" className="scroll-logo" aria-label={site.brand.backToTop} data-scroll-logo>
        <span className="scroll-logo-hit">
          <span className="scroll-logo-slot" data-scroll-logo-slot>
            <span className="scroll-logo-mark" data-scroll-logo-mark>
              <Wordmark />
            </span>
          </span>
        </span>
      </a>
      <ScrollLogoMotion />
    </header>
  )
}
