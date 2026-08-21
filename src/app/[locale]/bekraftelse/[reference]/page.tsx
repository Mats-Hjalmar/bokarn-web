import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { SiteShell } from '@/components/site-shell'
import { Button } from '@/components/ui/button'
import { fetchBooking, PriceTable, StaySummary } from '@/features/booking'
import { currentOperator } from '@/features/booking/operator'
import { fill, getDictionary, isLocale } from '@/lib/i18n'
import { UnknownOperator } from '../../unknown-operator'
import { NotFoundNotice } from '../../bokning/[reference]/not-found-notice'

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

  // The page reads the booking back from the API rather than rendering what the
  // action returned. It costs a request and buys a real property: what the guest
  // sees on their confirmation is what the database holds, so a refresh, a
  // bookmark and a screenshot all agree.
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
          <CheckCircle2 className="text-primary size-8" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.confirmation.heading}
          </h1>
          <p className="text-muted-foreground text-sm">
            {fill(t.confirmation.emailed, { email: booking.email })}
          </p>
        </header>

        <section className="bg-accent text-accent-foreground rounded-xl p-5">
          <div className="text-xs font-medium uppercase tracking-wide opacity-80">
            {t.confirmation.reference}
          </div>
          <div className="font-mono text-3xl font-semibold tracking-widest">
            {booking.reference}
          </div>
        </section>

        <section className="bg-card grid gap-5 rounded-xl border p-5 sm:p-6">
          <h2 className="text-sm font-semibold">{t.confirmation.stay}</h2>
          <StaySummary
            stay={stay}
            categoryName={booking.category_name}
            locale={locale}
            t={t}
          />
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

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">{t.confirmation.whatNext}</h2>
          <ol className="text-muted-foreground grid list-inside list-decimal gap-1.5 text-sm">
            {t.confirmation.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="grid gap-3 rounded-xl border border-dashed p-5">
          <h2 className="text-sm font-semibold">
            {t.confirmation.saveDetails}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t.confirmation.saveDetailsHelp}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link
                href={`/${locale}/registrera?email=${encodeURIComponent(
                  booking.email,
                )}`}
              >
                {t.confirmation.createAccount}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link
                href={`/${locale}/bokning/${booking.reference}?token=${encodeURIComponent(
                  token ?? '',
                )}`}
              >
                {t.confirmation.viewBooking}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteShell>
  )
}
