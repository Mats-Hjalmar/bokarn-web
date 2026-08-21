import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { fetchSites } from '@/features/booking'
import { getDictionary, isLocale, locales } from '@/lib/i18n'
import { tenantSlugFromHost } from '@/lib/tenant/host'
import '../globals.css'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/**
 * The tab says the campsite's name, not bokarn's.
 *
 * The operator is resolved here as well as in the pages, because metadata is
 * generated in its own pass and cannot read anything a page computed.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const slug = tenantSlugFromHost((await headers()).get('host'))
  if (!slug) return { title: t.app.name }

  try {
    const [site] = await fetchSites(slug)
    return site ? { title: site.name } : { title: t.app.name }
  } catch {
    // A title is not worth failing a page over.
    return { title: t.app.name }
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
