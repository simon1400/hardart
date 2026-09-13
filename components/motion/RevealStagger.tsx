import type { ComponentProps } from 'react'
import { Reveal } from '@/components/motion/RevealLines'

/** F. Children fade up one after another (tags, people, lists). */
export function RevealStagger({
  as = 'ul',
  ...props
}: Omit<ComponentProps<typeof Reveal>, 'kind'>) {
  return <Reveal kind="stagger" as={as} {...props} />
}
