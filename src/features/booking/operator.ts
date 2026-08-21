import 'server-only'

import { headers } from 'next/headers'
import { fetchSites } from './api'
import type { Site } from './types'
import { tenantSlugFromHost } from '@/lib/tenant/host'

/**
 * The operator every guest page is for, resolved from the hostname the browser
 * connected to and from nothing else.
 *
 * Returning null rather than throwing, and never falling back to a first or
 * default operator: a hostname nobody recognises has to say so. Quietly showing
 * one campsite's inventory under another's address is the single worst thing a
 * multi-tenant booking site can do.
 */
export async function currentOperator(): Promise<{
  slug: string
  site: Site
} | null> {
  const slug = tenantSlugFromHost((await headers()).get('host'))
  if (!slug) return null

  try {
    const sites = await fetchSites(slug)
    if (sites.length === 0) return null
    return { slug, site: sites[0] }
  } catch {
    return null
  }
}
