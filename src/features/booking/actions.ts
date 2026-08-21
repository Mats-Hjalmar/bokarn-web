'use server'

import { headers } from 'next/headers'
import { apiFetch, ApiError } from '@/lib/api/client'
import { apiBaseUrl } from '@/lib/config'
import { isLocale, type Locale } from '@/lib/i18n'
import { tenantSlugFromHost } from '@/lib/tenant/host'
import type { Confirmed, Hold, StayQuery } from './types'

/**
 * The operator is re-derived from the request inside every action, never taken
 * from an argument.
 *
 * A Server Action is a POST endpoint that anyone can call directly, so a slug
 * passed in from the client is a claim rather than a fact. The hostname is the
 * one thing the caller cannot choose: it is what the browser connected to, and
 * it is the same source the API itself uses.
 */
async function operator(): Promise<string> {
  const slug = tenantSlugFromHost((await headers()).get('host'))
  if (!slug) throw new Error('no operator for this hostname')
  return slug
}

/** Failure modes a guest can act on, kept separate from a crash. */
export type BookingFailure =
  | 'no_unit_available'
  | 'hold_expired'
  | 'quote_expired'
  | 'quote_mismatch'
  | 'invalid'
  | 'failed'

export type HoldResult =
  { ok: true; hold: Hold } | { ok: false; reason: BookingFailure }

export type ConfirmResult =
  | { ok: true; booking: Confirmed }
  | { ok: false; reason: BookingFailure; detail?: string }

export type GuestInput = {
  givenNames: string
  surname: string
  email: string
  phone: string
  countryOfResidence: string
}

export async function takeHold(
  categoryCode: string,
  stay: StayQuery,
): Promise<HoldResult> {
  const slug = await operator()

  try {
    const hold = await apiFetch<Hold>('/holds', {
      method: 'POST',
      baseUrl: apiBaseUrl(slug),
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        category_code: categoryCode,
        arrival: stay.arrival,
        departure: stay.departure,
        adults: stay.adults,
        children: stay.children.length,
        pets: stay.pets,
        electricity_amp: stay.electricityAmp,
        accessible: stay.accessible,
      }),
      cache: 'no-store',
    })
    return { ok: true, hold }
  } catch (error) {
    return { ok: false, reason: failureOf(error) }
  }
}

/**
 * Gives a held pitch back when a guest walks away from checkout.
 *
 * Best effort by design: the sweeper releases it within the minute anyway, so a
 * failure here costs one pitch for a short while and is not worth telling the
 * guest about.
 */
export async function releaseHold(token: string): Promise<void> {
  if (!token) return
  const slug = await operator()
  try {
    await apiFetch<void>(`/holds/${encodeURIComponent(token)}`, {
      method: 'DELETE',
      baseUrl: apiBaseUrl(slug),
      cache: 'no-store',
    })
  } catch {
    // Deliberately swallowed: see above.
  }
}

export async function confirmBooking(input: {
  quoteId: string
  holdToken: string
  idempotencyKey: string
  categoryCode: string
  stay: StayQuery
  guest: GuestInput
  locale: string
  marketingConsent: boolean
  notes: string
}): Promise<ConfirmResult> {
  const slug = await operator()

  const locale: Locale = isLocale(input.locale) ? input.locale : 'sv'

  try {
    const booking = await apiFetch<Confirmed>('/bookings', {
      method: 'POST',
      baseUrl: apiBaseUrl(slug),
      headers: {
        'Content-Type': 'application/json',
        // Supplied by the client and reused across retries of the same submit,
        // which is the whole point: a second tap has to be recognised as the
        // same booking rather than made into another one.
        'Idempotency-Key': input.idempotencyKey,
      },
      body: JSON.stringify({
        quote_id: input.quoteId,
        hold_token: input.holdToken,
        category_code: input.categoryCode,
        arrival: input.stay.arrival,
        departure: input.stay.departure,
        adults: input.stay.adults,
        children: input.stay.children.map((date_of_birth) => ({
          date_of_birth,
        })),
        pets: input.stay.pets,
        vehicles: 1,
        campaign_code: '',
        electricity_amp: input.stay.electricityAmp,
        accessible: input.stay.accessible,
        guest: {
          given_names: input.guest.givenNames,
          surname: input.guest.surname,
          email: input.guest.email,
          phone: input.guest.phone,
          country_of_residence: input.guest.countryOfResidence,
        },
        locale,
        marketing_consent: input.marketingConsent,
        notes: input.notes,
      }),
      cache: 'no-store',
    })
    return { ok: true, booking }
  } catch (error) {
    const reason = failureOf(error)
    const detail = error instanceof ApiError ? error.message : undefined
    return { ok: false, reason, detail }
  }
}

/**
 * Maps an API failure onto something the page can say.
 *
 * The API's problem type is the discriminator, not the status code: 409 covers
 * "the price moved" and "somebody took the pitch", and those need different
 * words in front of a guest. An unrecognised failure becomes 'failed' rather
 * than being reported as one of the known ones.
 */
function failureOf(error: unknown): BookingFailure {
  if (!(error instanceof ApiError)) return 'failed'
  switch (error.problemType) {
    case 'no_unit_available':
    case 'hold_expired':
    case 'quote_expired':
    case 'quote_mismatch':
      return error.problemType
    default:
      return error.status >= 400 && error.status < 500 ? 'invalid' : 'failed'
  }
}
