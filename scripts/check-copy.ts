// Fails the build if an em dash (U+2014) or the misspelling "Dimitro" appears in source.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const ROOTS = ['content', 'app', 'components', 'lib']
const EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.md', '.json', '.svg'])
const RULES: { name: string; pattern: RegExp }[] = [
  { name: 'em dash (U+2014)', pattern: /—/g },
  { name: '"Dimitro" (the name is Dmytro)', pattern: /dimitro/gi },
]

function walk(dir: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return walk(path)
    return EXTENSIONS.has(extname(path)) ? [path] : []
  })
}

const problems: string[] = []

for (const file of ROOTS.flatMap(walk)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    for (const rule of RULES) {
      if (line.match(rule.pattern)) {
        problems.push(`${relative(process.cwd(), file)}:${index + 1}  ${rule.name}`)
      }
    }
  })
}

if (problems.length > 0) {
  console.error(`check-copy: ${problems.length} problem(s)\n${problems.join('\n')}`)
  process.exit(1)
}

console.log('check-copy: ok')
