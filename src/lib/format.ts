import type { Locale } from '@/lib/i18n'

/**
 * The locale the site is served in is a two-letter code; number and date
 * formatting needs a region to know that Swedish uses a comma and a space and
 * British English uses a point. The mapping is explicit rather than derived,
 * because "en" alone formats as en-US and puts the month first, which is wrong
 * for every market this site serves.
 */
const intlLocales: Record<Locale, string> = {
  sv: 'sv-SE',
  en: 'en-GB',
  de: 'de-DE',
}

/** Money is stored and passed as minor units. It becomes a decimal only here. */
export function money(minor: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100)
}

export function shortDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${iso}T12:00:00`))
}

export function longDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`))
}

/** Nights between two dates. Departure is exclusive, so this is a subtraction. */
export function nights(arrival: string, departure: string): number {
  const from = Date.parse(`${arrival}T12:00:00`)
  const to = Date.parse(`${departure}T12:00:00`)
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0
  return Math.round((to - from) / 86_400_000)
}

/** Today, and today plus n days, as the YYYY-MM-DD a date input wants. */
export function isoDay(offsetDays = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}
