// Feature flags for extras beyond the design spec (CLAUDE.md §10). All off by default: turning one
// on for the live site is one boolean here.
export const featureDefaults = {
  heroGrain: false,
  mediaHover: false,
  cursor: true, // on for the live site (Dmytro, 2026-09-14)
}

export type Feature = keyof typeof featureDefaults

// next.config.ts resolves the defaults plus `HARDART_FLAGS` (comma separated names or `all`, for
// local checks and tests) into `HARDART_FLAG_<name>` build constants. Next inlines them as string
// literals, so a disabled flag folds to `false` and its component is dropped from the bundle.
export const features = {
  heroGrain: process.env.HARDART_FLAG_heroGrain === 'true',
  mediaHover: process.env.HARDART_FLAG_mediaHover === 'true',
  cursor: process.env.HARDART_FLAG_cursor === 'true',
} as const satisfies Record<Feature, boolean>

/** The module in components/flags/ that holds each flag. */
const flagModules: Record<Feature, string> = {
  heroGrain: 'Grain',
  mediaHover: 'MediaHover',
  cursor: 'Cursor',
}

/** Build configuration for next.config.ts: `env` constants and aliases for disabled modules. */
export function featureBuild(override = '') {
  const forced = override.split(',').map((name) => name.trim())
  const names = Object.keys(featureDefaults) as Feature[]
  const enabled = (name: Feature) =>
    featureDefaults[name] || forced.includes(name) || forced.includes('all')
  return {
    env: Object.fromEntries(names.map((name) => [`HARDART_FLAG_${name}`, String(enabled(name))])),
    // A disabled flag's module resolves to an empty stub, so it cannot reach the client bundle.
    resolveAlias: Object.fromEntries(
      names
        .filter((name) => !enabled(name))
        .map((name) => [`@/components/flags/${flagModules[name]}`, './components/flags/Off.tsx']),
    ),
  }
}
