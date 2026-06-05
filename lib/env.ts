import { existsSync, readFileSync } from 'node:fs'

function loadEnvFile(path: string, override: boolean): void {
  if (!existsSync(path)) return

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')

    if (override) process.env[key] = value
    else process.env[key] ??= value
  }
}

/** Carga `.env` y luego `.env.local` (misma prioridad que Next.js para Drizzle CLI). */
export function loadDotEnv(): void {
  loadEnvFile('.env', false)
  loadEnvFile('.env.local', true)
}
