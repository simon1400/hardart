import type { Cursor as CursorComponent } from '@/components/flags/Cursor'
import type { Grain as GrainComponent } from '@/components/flags/Grain'
import type { MediaHover as MediaHoverComponent } from '@/components/flags/MediaHover'

// Stand in for a disabled flag's module. next.config.ts aliases the flag module to this file, so
// the client component is not in the module graph at all: Turbopack bundles every client component
// a server component imports, rendered or not. Type imports only, nothing is loaded.
export const Grain: (...props: Parameters<typeof GrainComponent>) => null = () => null
export const MediaHover: (...props: Parameters<typeof MediaHoverComponent>) => null = () => null
export const Cursor: (...props: Parameters<typeof CursorComponent>) => null = () => null
