// Content Security Policy for the static export (CLAUDE.md §13, decision 028).
//
// Two policies are enforced together, and the browser applies both:
// - the <meta> policy that scripts/csp.ts writes into every exported HTML file after `next build`.
//   It allows inline scripts only by their sha256 hash (the head class swap and Next's
//   `self.__next_f` payload chunks change with every build, so no static header can list them);
// - the header policy that Nginx sends (nginx/hardart.cz.conf). It cannot know the hashes, so it
//   allows inline scripts and adds what a <meta> policy may not carry (frame-ancestors).

export type CspOrigins = {
  /** ImageKit origin for project media, e.g. https://ik.imagekit.io. */
  imagekit?: string
  /** Umami origin, which serves script.js and receives /api/send. */
  umami?: string
}

/** Origins from the build environment. */
export function envOrigins(env: NodeJS.ProcessEnv = process.env): CspOrigins {
  return {
    imagekit: origin(env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT),
    umami: umamiConfig(env)?.origin,
  }
}

/** Umami is wired only when both the host and the website id are set. */
export function umamiConfig(env: NodeJS.ProcessEnv = process.env) {
  const host = origin(env.NEXT_PUBLIC_UMAMI_HOST)
  const id = env.NEXT_PUBLIC_UMAMI_ID
  return host && id ? { origin: host, script: `${host}/script.js`, websiteId: id } : undefined
}

function origin(url: string | undefined) {
  return url ? new URL(url).origin : undefined
}

function serialise(directives: Record<string, (string | undefined)[]>) {
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values.filter(Boolean)].join(' '))
    .join('; ')
}

function directives(origins: CspOrigins, scripts: string[]) {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", ...scripts, origins.umami],
    'style-src': ["'self'"],
    'img-src': ["'self'", 'data:', origins.imagekit],
    'media-src': ["'self'", origins.imagekit],
    'font-src': ["'self'"],
    'connect-src': ["'self'", origins.umami],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'none'"],
  }
}

/** The policy written into the HTML: inline scripts by hash only. */
export function metaPolicy(origins: CspOrigins, scriptHashes: string[]) {
  return serialise(
    directives(
      origins,
      scriptHashes.map((hash) => `'sha256-${hash}'`),
    ),
  )
}

/** The policy Nginx sends as a header. */
export function headerPolicy(origins: CspOrigins) {
  return serialise({
    ...directives(origins, ["'unsafe-inline'"]),
    'frame-ancestors': ["'none'"],
  })
}
