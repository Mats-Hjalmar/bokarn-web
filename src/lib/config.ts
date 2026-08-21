import 'server-only'

/**
 * The API is addressed per operator, because the API resolves the operator from
 * the hostname it was called on and there is no other way in for a guest
 * request: a header would be attacker-controlled and the backend refuses one.
 *
 * A template rather than a base URL, so the slug that came out of the browser's
 * hostname goes back into the one the server calls. Setting a Host header on an
 * outgoing fetch would also work and was rejected: it makes the request's
 * routing and its identity disagree, which is the kind of thing that works in
 * development and breaks behind a load balancer.
 */
const API_URL_TEMPLATE =
  process.env.BOKARN_API_URL_TEMPLATE ??
  'http://{slug}.api.bokarn.localhost/api/v1'

export function apiBaseUrl(slug: string): string {
  return API_URL_TEMPLATE.replaceAll('{slug}', slug)
}

/** Operator-independent calls, such as the health probe. */
export const API_BASE_URL =
  process.env.BOKARN_API_URL ?? 'http://api.bokarn.localhost/api/v1'

export const KRATOS_URL =
  process.env.BOKARN_KRATOS_URL ?? 'http://auth.bokarn.localhost'

/** The browser talks to Kratos directly during registration. */
export const PUBLIC_KRATOS_URL =
  process.env.NEXT_PUBLIC_BOKARN_KRATOS_URL ?? 'http://auth.bokarn.localhost'
