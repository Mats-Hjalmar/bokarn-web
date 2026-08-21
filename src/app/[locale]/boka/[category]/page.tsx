import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SiteShell } from '@/components/site-shell'
import {
  CheckoutForm,
  createQuote,
  PriceTable,
  StaySummary,
  stayFromParams,
  stayToParams,
  type Quote,
} from '@/features/booking'
import { currentOperator } from '@/features/booking/operator'
import { getDictionary, isLocale } from '@/lib/i18n'
import { UnknownOperator } from '../../unknown-operator'

type Search = Record<string, string | string[] | undefined>

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>
  searchParams: Promise<Search>
}) {
  const { locale, category } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const operator = await currentOperator()
  if (!operator) return <UnknownOperator locale={locale} t={t} />

  const stay = stayFromParams(await searchParams)
  if (!stay.arrival || !stay.departure) notFound()

  // The quote is created here rather than carried from the search page, so the
  // breakdown the guest is about to agree to is one the server has just stored
  // and can be held to. A price passed through a URL is a price anyone can
  // rewrite.
  let quote: Quote
  try {
    quote = await createQuote(operator.slug, category, stay)
  } catch {
    notFound()
  }

  return (
    <SiteShell
      siteName={operator.site.name}
      municipality={operator.site.municipality}
      locale={locale}
      t={t}
    >
      <div className="grid gap-8">
        <Link
          href={`/${locale}?${stayToParams(stay)}`}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t.common.back}
        </Link>

        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.book.heading}
          </h1>
        </header>

        <section className="bg-card grid gap-5 rounded-xl border p-5 sm:p-6">
          <StaySummary
            stay={stay}
            categoryName={quote.category_name}
            locale={locale}
            t={t}
          />
          <hr />
          <div className="grid gap-3">
            <h2 className="text-sm font-semibold">{t.book.breakdown}</h2>
            <PriceTable
              lines={quote.lines}
              totals={quote.totals}
              locale={locale}
              t={t}
            />
          </div>
        </section>

        <section>
          <CheckoutForm
            quote={quote}
            categoryCode={category}
            stay={stay}
            locale={locale}
            t={t}
          />
        </section>
      </div>
    </SiteShell>
  )
}
