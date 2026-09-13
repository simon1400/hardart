import { Wordmark } from '@/components/ui/Wordmark'
import { site } from '@/content/site'

// Phase 2: the corner end state, fixed from the start (also the reduced motion state).
// Phase 4 adds the scroll scrubbed move from the hero and the footer colour flip.
export function ScrollLogo() {
  return (
    <header>
      <a href="#top" className="corner-logo" aria-label={site.brand.backToTop}>
        <span>
          <Wordmark />
        </span>
      </a>
    </header>
  )
}
