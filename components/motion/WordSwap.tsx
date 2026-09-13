type WordSwapProps = { options: readonly string[]; after?: string }

// D. Server markup for the word swap; the loop runs in components/motion/scenes.ts.
// Every option sits in the same inline grid cell, so the slot is always as wide as the longest one
// and the line never reflows. The trailing text travels with each option, so the free space of a
// shorter word stays at the end of the line. Without motion only the first option is visible.
export function WordSwap({ options, after = '' }: WordSwapProps) {
  return (
    <span className="word-swap" data-word-swap>
      {options.map((option, index) => (
        <span key={option} className="word-swap-word" data-first={index === 0 ? '' : undefined}>
          {option}
          {after}
        </span>
      ))}
    </span>
  )
}
