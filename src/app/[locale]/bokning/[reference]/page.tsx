import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/site-shell'
import { Badge } from '@/components/ui/badge'
import { fetchBooking, PriceTable, StaySummary } from '@/features/booking'
import { currentOperator } from '@/features/booking/operator'
import { getDictionary, isLocale } from '@/lib/i18n'
import { UnknownOperator } from '../../unknown-operator'
import { NotFoundNotice } from './not-found-notice'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; reference: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { locale, reference } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const operator = await currentOperator()
  if (!operator) return <UnknownOperator locale={locale} t={t} />

  const { token } = await searchParams
  const booking = token
    ? await fetchBooking(operator.slug, reference, token).catch(() => null)
    : null

  if (!booking) {
    return (
      <SiteShell
        siteName={operator.site.name}
        municipality={operator.site.municipality}
        locale={locale}
        t={t}
      >
        <NotFoundNotice t={t} />
      </SiteShell>
    )
  }

  const stay = {
    arrival: booking.arrival,
    departure: booking.departure,
    adults: booking.adults,
    children: Array.from({ length: booking.children }, () => ''),
    pets: booking.pets,
    electricityAmp: 0,
    accessible: false,
  }

  return (
    <SiteShell
      siteName={operator.site.name}
      municipality={operator.site.municipality}
      locale={locale}
      t={t}
    >
      <div className="grid max-w-2xl gap-8">
        <header className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t.booking.heading}
            </h1>
            <Badge variant="secondary">
              {t.booking.state[booking.state] ?? booking.state}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-sm tracking-widest">
            {booking.reference}
          </p>
        </header>

        <section className="bg-card grid gap-5 rounded-xl border p-5 sm:p-6">
          <StaySummary
            stay={stay}
            categoryName={booking.category_name}
            locale={locale}
            t={t}
          />
          <hr />
          <div className="text-sm">
            <span className="text-muted-foreground">{t.booking.pitch}: </span>
            {/*
              The pitch appears only once the guest is standing on it. Up to
              check-in the assignment is provisional and staff move people
              freely, so a number here would be a promise nobody made.
            */}
            <span className="font-medium">
              {booking.unit_code || t.booking.pitchPending}
            </span>
          </div>
          <hr />
          <PriceTable
            lines={booking.lines}
            totals={{
              gross_minor: booking.total_gross_minor,
              net_minor: booking.total_net_minor,
              vat_minor: booking.total_vat_minor,
              currency: booking.currency,
              by_rate: {},
            }}
            locale={locale}
            t={t}
          />
        </section>
      </div>
    </SiteShell>
  )
}
