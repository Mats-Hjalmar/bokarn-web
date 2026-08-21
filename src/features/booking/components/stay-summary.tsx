import { CalendarDays, Dog, Users, Zap } from 'lucide-react'
import { longDate, nights } from '@/lib/format'
import { plural, type Dictionary, type Locale } from '@/lib/i18n'
import type { StayQuery } from '../types'

/** What the guest asked for, restated so they can check it before committing. */
export function StaySummary({
  stay,
  categoryName,
  locale,
  t,
}: {
  stay: StayQuery
  categoryName?: string
  locale: Locale
  t: Dictionary
}) {
  const guests = stay.adults + stay.children.length

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {categoryName ? (
        <Row
          icon={<CalendarDays className="size-4" aria-hidden />}
          label={t.confirmation.accommodation}
          value={categoryName}
        />
      ) : null}
      <Row
        icon={<CalendarDays className="size-4" aria-hidden />}
        label={`${t.confirmation.arrival} – ${t.confirmation.departure}`}
        value={`${longDate(stay.arrival, locale)} – ${longDate(
          stay.departure,
          locale,
        )} (${plural(t.search.nights, nights(stay.arrival, stay.departure))})`}
      />
      <Row
        icon={<Users className="size-4" aria-hidden />}
        label={t.confirmation.guests}
        value={
          stay.children.length > 0
            ? `${plural(t.search.guests, guests)} · ${stay.adults} ${t.search.adults.toLowerCase()}, ${stay.children.length} ${t.search.children.toLowerCase()}`
            : plural(t.search.guests, guests)
        }
      />
      {stay.pets > 0 ? (
        <Row
          icon={<Dog className="size-4" aria-hidden />}
          label={t.search.pets}
          value={String(stay.pets)}
        />
      ) : null}
      {stay.electricityAmp > 0 ? (
        <Row
          icon={<Zap className="size-4" aria-hidden />}
          label={t.search.electricity}
          value={`${stay.electricityAmp} ${t.search.amp}`}
        />
      ) : null}
    </dl>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  )
}
