import Link from 'next/link'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { money, nights } from '@/lib/format'
import { fill, plural, type Dictionary, type Locale } from '@/lib/i18n'
import { stayToParams, type CategoryOffer, type StayQuery } from '../types'

/** A category with the price the engine gave it for this exact stay. */
export type PricedOffer = CategoryOffer & {
  totalGrossMinor: number | null
  currency: string
}

export function OfferList({
  offers,
  stay,
  locale,
  t,
}: {
  offers: PricedOffer[]
  stay: StayQuery
  locale: Locale
  t: Dictionary
}) {
  if (offers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="font-medium">{t.search.noResults}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {t.search.noResultsHelp}
        </p>
      </div>
    )
  }

  const stayNights = nights(stay.arrival, stay.departure)
  const params = stayToParams(stay)

  return (
    <ul className="grid gap-4">
      {offers.map((offer) => (
        <li key={offer.code}>
          <article className="bg-card flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{offer.name}</h3>
                <Badge variant="secondary">
                  {plural(t.search.free, offer.free)}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                <Users className="size-3.5" aria-hidden />
                {fill(t.search.sleeps, { n: offer.max_occupancy })}
              </p>
            </div>

            <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
              <div className="text-right">
                {offer.totalGrossMinor === null ? (
                  // A category that availability offered but pricing refused is
                  // shown without a price rather than hidden: the guest can
                  // still ask reception, and silently dropping it would look
                  // like the campsite is full.
                  <span className="text-muted-foreground text-sm">—</span>
                ) : (
                  <>
                    <div className="text-xl font-semibold tracking-tight">
                      {money(offer.totalGrossMinor, offer.currency, locale)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {plural(t.search.nights, stayNights)} · {t.search.perStay}
                    </div>
                  </>
                )}
              </div>

              <Button asChild>
                <Link
                  href={`/${locale}/boka/${encodeURIComponent(
                    offer.code,
                  )}?${params}`}
                >
                  {t.search.choose}
                </Link>
              </Button>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}
