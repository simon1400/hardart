import { ScrollLogoMotion } from '@/components/motion/ScrollLogoMotion'
import { Wordmark } from '@/components/ui/Wordmark'
import { site } from '@/content/site'

// B. The one fixed wordmark. The link is always the small corner hit area; the mark inside it is
// what moves. Without motion (no JS, reduced motion, ?motion=off) the mark sits in the corner slot,
// in accent, and shows once the hero wordmark has scrolled away. With motion, ScrollLogoMotion lays
// the mark over the hero wordmark and scrubs it into the slot, turning from ink to accent as it
// shrinks: an accent copy on top of the ink one fades in (opacity only, no repaint).
export function ScrollLogo() {
  return (
    <header>
      <a href="#top" className="scroll-logo" aria-label={site.brand.backToTop} data-scroll-logo>
        <span className="scroll-logo-hit">
          <span className="scroll-logo-slot" data-scroll-logo-slot>
            <span className="scroll-logo-mark" data-scroll-logo-mark>
              <Wordmark className="scroll-logo-ink" data-scroll-logo-ink />
              <Wordmark className="scroll-logo-accent" data-scroll-logo-accent />
            </span>
          </span>
        </span>
      </a>
      <ScrollLogoMotion />
    </header>
  )
}
