import { existsSync, readFileSync } from 'node:fs'

export function loadDotEnv(path = '.env'): void {
  if (!existsSync(path)) return

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim()

    process.env[key] ??= value.replace(/^['"]|['"]$/g, '')
  }
}
