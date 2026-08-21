'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fill, type Dictionary, type Locale } from '@/lib/i18n'
import {
  confirmBooking,
  releaseHold,
  takeHold,
  type BookingFailure,
} from '../actions'
import type { Quote, StayQuery } from '../types'

/** Countries offered on the form, in the order a Nordic campsite sees them. */
const countries = [
  'SE',
  'NO',
  'DK',
  'FI',
  'DE',
  'NL',
  'GB',
  'FR',
  'BE',
  'CH',
  'AT',
  'PL',
  'EE',
  'LV',
  'LT',
  'IS',
  'IE',
  'IT',
  'ES',
  'CZ',
  'US',
] as const

export function CheckoutForm({
  quote,
  categoryCode,
  stay,
  locale,
  t,
}: {
  quote: Quote
  categoryCode: string
  stay: StayQuery
  locale: Locale
  t: Dictionary
}) {
  const router = useRouter()

  const [holdToken, setHoldToken] = useState('')
  const [holdExpires, setHoldExpires] = useState<number | null>(null)
  const [failure, setFailure] = useState<BookingFailure | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // One key per visit to this page, reused across retries of the same submit.
  // That is what makes a second tap the same booking rather than another one,
  // and it is generated once rather than per attempt for exactly that reason.
  const idempotencyKey = useRef(crypto.randomUUID())

  // The pitch is held while the guest fills the form in, not at submit time.
  // Holding at submit would make the reservation pointless: the race it exists
  // to win happens during the two minutes somebody spends typing a phone
  // number on a campsite's mobile signal.
  useEffect(() => {
    let cancelled = false
    let token = ''

    void takeHold(categoryCode, stay).then((result) => {
      if (cancelled) {
        // The guest left before the hold came back. Give it straight back
        // rather than leaving a pitch reserved for somebody who has gone.
        if (result.ok) void releaseHold(result.hold.hold_token)
        return
      }
      if (!result.ok) {
        setFailure(result.reason)
        return
      }
      token = result.hold.hold_token
      setHoldToken(token)
      setHoldExpires(Date.parse(result.hold.expires_at))
    })

    return () => {
      cancelled = true
      if (token) void releaseHold(token)
    }
    // The stay and category are fixed for the life of this page: they came out
    // of the URL, and a change to either is a different page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setFailure(null)

    const result = await confirmBooking({
      quoteId: quote.id,
      holdToken,
      idempotencyKey: idempotencyKey.current,
      categoryCode,
      stay,
      guest: {
        givenNames: String(form.get('given_names') ?? '').trim(),
        surname: String(form.get('surname') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        countryOfResidence: String(form.get('country') ?? ''),
      },
      locale,
      marketingConsent: form.get('marketing') === 'on',
      notes: String(form.get('notes') ?? '').trim(),
    })

    if (!result.ok) {
      setSubmitting(false)
      setFailure(result.reason)
      return
    }

    // The token is the guest's own credential for their booking, so it travels
    // in the URL of the page that shows it and is never persisted here.
    const params = new URLSearchParams({ token: result.booking.access_token })
    router.replace(
      `/${locale}/bekraftelse/${result.booking.reference}?${params}`,
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      {holdExpires ? <HoldCountdown until={holdExpires} t={t} /> : null}
      {failure ? <Failure reason={failure} locale={locale} t={t} /> : null}

      <fieldset className="grid gap-4" disabled={submitting}>
        <legend className="mb-1 text-sm font-semibold">
          {t.book.yourDetails}
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="given_names">{t.book.givenNames}</Label>
            <Input
              id="given_names"
              name="given_names"
              autoComplete="given-name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="surname">{t.book.surname}</Label>
            <Input
              id="surname"
              name="surname"
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="email">{t.book.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <p className="text-muted-foreground text-xs">{t.book.emailHelp}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">{t.book.phone}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="country">{t.book.country}</Label>
          {/*
            A plain select, with no country preselected. Country of residence is
            the key the official visitor statistics are reported by, and a
            defaulted one is a wrong figure in a public return rather than a
            small convenience.
          */}
          <select
            id="country"
            name="country"
            required
            defaultValue=""
            className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none"
          >
            <option value="" disabled>
              —
            </option>
            {countries.map((code) => (
              <option key={code} value={code}>
                {countryName(code, locale)}
              </option>
            ))}
          </select>
          <p className="text-muted-foreground text-xs">{t.book.countryHelp}</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">{t.book.notes}</Label>
          <Input
            id="notes"
            name="notes"
            placeholder={t.book.notesPlaceholder}
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <Checkbox id="marketing" name="marketing" className="mt-0.5" />
          {t.book.marketing}
        </label>
      </fieldset>

      <p className="text-muted-foreground border-l-2 pl-3 text-sm">
        {t.book.terms}
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="sm:w-fit"
      >
        {submitting ? t.book.submitting : t.book.submit}
      </Button>
    </form>
  )
}

/**
 * The countdown is honest about what it is: the pitch really is released when it
 * runs out, and the confirm path really does re-check. Showing it is what makes
 * an eventual "somebody took it" message make sense rather than look arbitrary.
 */
function HoldCountdown({ until, t }: { until: number; t: Dictionary }) {
  const [remaining, setRemaining] = useState(() => until - Date.now())

  useEffect(() => {
    const timer = setInterval(() => setRemaining(until - Date.now()), 1000)
    return () => clearInterval(timer)
  }, [until])

  if (remaining <= 0) return null
  const minutes = Math.ceil(remaining / 60_000)

  return (
    <p className="text-muted-foreground flex items-center gap-2 text-sm">
      <Clock className="size-4" aria-hidden />
      {fill(t.book.holdExpires, { n: minutes })}
    </p>
  )
}

function Failure({
  reason,
  locale,
  t,
}: {
  reason: BookingFailure
  locale: Locale
  t: Dictionary
}) {
  const message =
    reason === 'hold_expired' || reason === 'no_unit_available'
      ? t.book.holdLost
      : reason === 'quote_expired' || reason === 'quote_mismatch'
        ? t.book.priceMoved
        : reason === 'invalid'
          ? t.book.required
          : t.book.failed

  const showSearchAgain = reason !== 'invalid' && reason !== 'failed'

  return (
    <div
      role="alert"
      className="border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4 text-sm"
    >
      <AlertCircle
        className="text-destructive mt-0.5 size-4 shrink-0"
        aria-hidden
      />
      <div>
        <p>{message}</p>
        {showSearchAgain ? (
          <a href={`/${locale}`} className="mt-1 inline-block underline">
            {t.search.submit}
          </a>
        ) : null}
      </div>
    </div>
  )
}

function countryName(code: string, locale: Locale): string {
  // Intl knows every country in every locale, so a hand-kept translation table
  // would only be a way to get one of them wrong.
  const names = new Intl.DisplayNames([locale], { type: 'region' })
  return names.of(code) ?? code
}
