/**
 * Types are hand-written per feature rather than generated from the OpenAPI
 * document. The document is for humans reading /docs; a generated client would
 * pull the whole API surface into a site that touches four endpoints, and every
 * rename in an unrelated part of the backend would become a build failure here.
 */

/** Money everywhere is minor units — öre — never a float. */
export type Minor = number

export type Site = {
  id: string
  name: string
  slug: string
  municipality: string
  country: string
  check_in_time: string
  check_out_time: string
}

export type CategoryOffer = {
  code: string
  name: string
  kind: string
  max_occupancy: number
  free: number
}

export type Availability = {
  arrival: string
  departure: string
  nights: number
  categories: CategoryOffer[]
}

export type QuoteLine = {
  seq: number
  kind: string
  stay_date?: string
  description: string
  qty: number
  unit_gross_minor: Minor
  gross_minor: Minor
  net_minor: Minor
  vat_minor: Minor
  vat_code: string
  vat_rate_bp: number
}

export type QuoteTotals = {
  gross_minor: Minor
  net_minor: Minor
  vat_minor: Minor
  currency: string
  by_rate: Record<string, Minor>
}

export type Quote = {
  id: string
  category_code: string
  category_name: string
  arrival: string
  departure: string
  expires_at: string
  input_hash: string
  breakdown_hash: string
  engine_version: number
  nights: number
  lines: QuoteLine[]
  totals: QuoteTotals
}

export type Hold = {
  hold_token: string
  category_code: string
  /** The pitch chosen behind the scenes. Never shown to the guest. */
  unit_code: string
  arrival: string
  departure: string
  expires_at: string
}

export type Confirmed = {
  reference: string
  access_token: string
  state: string
  category_code: string
  arrival: string
  departure: string
  nights: number
  currency: string
  total_gross_minor: Minor
  total_net_minor: Minor
  total_vat_minor: Minor
  guest_name: string
  email: string
}

export type BookingDetail = {
  id: string
  reference: string
  guest_name: string
  email: string
  phone: string
  category_code: string
  category_name: string
  /** Empty until the guest has checked in: assignment is provisional. */
  unit_code: string
  arrival: string
  departure: string
  nights: number
  state: string
  adults: number
  children: number
  pets: number
  currency: string
  total_gross_minor: Minor
  total_net_minor: Minor
  total_vat_minor: Minor
  country_of_residence: string
  locale: string
  notes?: string
  lines: QuoteLine[]
}

/** The stay a guest is asking about, as it travels between pages. */
export type StayQuery = {
  arrival: string
  departure: string
  adults: number
  children: string[]
  pets: number
  electricityAmp: number
  accessible: boolean
}

export const emptyStay = (): StayQuery => ({
  arrival: '',
  departure: '',
  adults: 2,
  children: [],
  pets: 0,
  electricityAmp: 0,
  accessible: false,
})

/**
 * The stay travels through the URL rather than through a store, so a guest can
 * bookmark a search, open two in tabs, and press back without the page and the
 * price disagreeing about what was asked for.
 */
export function stayToParams(stay: StayQuery): URLSearchParams {
  const params = new URLSearchParams({
    arrival: stay.arrival,
    departure: stay.departure,
    adults: String(stay.adults),
  })
  if (stay.children.length > 0) params.set('children', stay.children.join(','))
  if (stay.pets > 0) params.set('pets', String(stay.pets))
  if (stay.electricityAmp > 0) params.set('el', String(stay.electricityAmp))
  if (stay.accessible) params.set('accessible', '1')
  return params
}

export function stayFromParams(
  params: Record<string, string | string[] | undefined>,
): StayQuery {
  const one = (key: string) => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
  }
  const int = (key: string, fallback: number) => {
    const parsed = Number.parseInt(one(key) ?? '', 10)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
  }

  const children = (one('children') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))

  return {
    arrival: one('arrival') ?? '',
    departure: one('departure') ?? '',
    adults: Math.max(1, int('adults', 2)),
    children,
    pets: int('pets', 0),
    electricityAmp: int('el', 0),
    accessible: one('accessible') === '1',
  }
}
