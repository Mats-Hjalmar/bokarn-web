import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/site-shell'
import {
  createQuote,
  OfferList,
  SearchForm,
  searchAvailability,
  stayFromParams,
  type PricedOffer,
} from '@/features/booking'
import { currentOperator } from '@/features/booking/operator'
import { getDictionary, isLocale } from '@/lib/i18n'
import { UnknownOperator } from './unknown-operator'

type Search = Record<string, string | string[] | undefined>

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Search>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const operator = await currentOperator()
  if (!operator) return <UnknownOperator locale={locale} t={t} />

  const stay = stayFromParams(await searchParams)
  const searched = stay.arrival !== '' && stay.departure !== ''

  const offers = searched ? await priceOffers(operator.slug, stay) : null

  return (
    <SiteShell
      siteName={operator.site.name}
      municipality={operator.site.municipality}
      locale={locale}
      t={t}
    >
      <div className="grid gap-10">
        <section className="grid gap-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.search.heading}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-prose text-sm">
              {t.search.intro}
            </p>
          </header>
          <SearchForm initial={stay} locale={locale} t={t} />
        </section>

        {offers ? (
          <section className="grid gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {t.search.resultsFor}
            </h2>
            <OfferList offers={offers} stay={stay} locale={locale} t={t} />
          </section>
        ) : null}
      </div>
    </SiteShell>
  )
}

/**
 * Availability answers what is free; the engine answers what it costs. The two
 * are separate calls because they are separate questions, and a category that
 * is free but unpriceable — an uncompiled calendar, a stay rule it violates —
 * has to be distinguishable from one that is full.
 *
 * The quotes are fetched in parallel and a failure becomes a missing price
 * rather than a failed page: one closed cabin must not hide the pitches.
 */
async function priceOffers(
  slug: string,
  stay: Parameters<typeof searchAvailability>[1],
): Promise<PricedOffer[]> {
  const availability = await searchAvailability(slug, stay)

  return Promise.all(
    availability.categories.map(async (category) => {
      try {
        const quote = await createQuote(slug, category.code, stay)
        return {
          ...category,
          totalGrossMinor: quote.totals.gross_minor,
          currency: quote.totals.currency,
        }
      } catch {
        return { ...category, totalGrossMinor: null, currency: 'SEK' }
      }
    }),
  )
}
