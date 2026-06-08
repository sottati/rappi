/** Valida rutas internas para redirect post-login (evita open redirects). */
export function sanitizeNextPath(next: string | null | undefined): string | null {
  if (!next) return null
  const trimmed = next.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (trimmed.startsWith('/login') || trimmed.startsWith('/signin')) return null
  return trimmed
}
