import 'server-only'

/**
 * tenantSlugFromHost maps a request Host to the operator whose site is being
 * browsed. It is the only source of tenant identity for guests: a header or
 * body value would be attacker-controlled, and the backend refuses those.
 *
 * Returns null when the host carries no operator subdomain, which the caller
 * must treat as "no site selected" rather than defaulting to one.
 */
export function tenantSlugFromHost(host: string | null): string | null {
  if (!host) return null

  const name = host.split(':')[0]
  const labels = name.split('.')
  if (labels.length < 2) return null

  const slug = labels[0]
  if (slug === 'www' || slug === 'localhost') return null
  return slug
}
