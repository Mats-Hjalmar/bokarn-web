import 'server-only'

/**
 * tenantSlugFromHost maps a request Host to the operator whose site is being
 * browsed. It is the only source of tenant identity for guests: a header or
 * body value would be attacker-controlled, and the backend refuses those.
 *
 * Returns null when the host carries no operator subdomain, which the caller
 * must treat as "no site selected" rather than defaulting to one.
 */
/**
 * First labels that name a service rather than an operator.
 *
 * Operators and services share one hostname namespace, so that a guest URL
 * looks the way it should — storsand.bokarn.se, not storsand.web.bokarn.se.
 * The cost is this list: without it, api.<domain> resolves to an operator
 * called "api". It mirrors ReservedSlugs in the backend's
 * internal/tenant/hosts.go, and the two must move together.
 */
const RESERVED = new Set([
  'api',
  'auth',
  'auth-admin',
  'auth-staff',
  'auth-staff-admin',
  'dashboard',
  'dev-proxy',
  'grafana',
  'localhost',
  'mail',
  'otlp',
  'web',
  'www',
])

export function tenantSlugFromHost(host: string | null): string | null {
  if (!host) return null

  const name = host.split(':')[0]
  const labels = name.split('.')
  if (labels.length < 2) return null

  // DNS is case-insensitive and proxies normalise inconsistently.
  const slug = labels[0].toLowerCase()
  if (slug === '' || RESERVED.has(slug)) return null
  return slug
}
