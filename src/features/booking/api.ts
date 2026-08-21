import 'server-only'

import { apiFetch } from '@/lib/api/client'
import { apiBaseUrl } from '@/lib/config'
import type {
  Availability,
  BookingDetail,
  Quote,
  Site,
  StayQuery,
} from './types'

/**
 * Every call names the operator, because the API resolves the operator from the
 * hostname it was called on and has no other way to learn it for a guest.
 *
 * The slug is a required first argument on each of these rather than something
 * a caller may omit. Getting it wrong is not a visible failure: the request
 * simply arrives with no operator and the API answers "no operator selected",
 * which reads like a bug in the page rather than a missing argument.
 */
export async function fetchSites(slug: string): Promise<Site[]> {
  return apiFetch<Site[]>('/sites', {
    baseUrl: apiBaseUrl(slug),
    revalidate: 60,
  })
}

export async function searchAvailability(
  slug: string,
  stay: StayQuery,
): Promise<Availability> {
  const params = new URLSearchParams({
    arrival: stay.arrival,
    departure: stay.departure,
    adults: String(stay.adults),
    children: String(stay.children.length),
  })
  if (stay.pets > 0) params.set('pets', String(stay.pets))
  if (stay.electricityAmp > 0) {
    params.set('electricity_amp', String(stay.electricityAmp))
  }
  if (stay.accessible) params.set('accessible', 'true')

  return apiFetch<Availability>(`/availability?${params}`, {
    baseUrl: apiBaseUrl(slug),
    // Not cached here. The API caches this itself and invalidates it whenever
    // occupancy changes; a second cache in front of that would reintroduce
    // exactly the staleness the invalidation removes.
    cache: 'no-store',
  })
}

export async function createQuote(
  slug: string,
  categoryCode: string,
  stay: StayQuery,
): Promise<Quote> {
  return apiFetch<Quote>('/quotes', {
    method: 'POST',
    baseUrl: apiBaseUrl(slug),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category_code: categoryCode,
      arrival: stay.arrival,
      departure: stay.departure,
      adults: stay.adults,
      children: stay.children.map((date_of_birth) => ({ date_of_birth })),
      pets: stay.pets,
      vehicles: 1,
      campaign_code: '',
    }),
    cache: 'no-store',
  })
}

export async function fetchBooking(
  slug: string,
  reference: string,
  token: string,
): Promise<BookingDetail> {
  const params = new URLSearchParams({ token })
  return apiFetch<BookingDetail>(
    `/bookings/${encodeURIComponent(reference)}?${params}`,
    { baseUrl: apiBaseUrl(slug), cache: 'no-store' },
  )
}
