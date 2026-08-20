import { API_BASE_URL } from '@/lib/config'

/** Shape of an RFC-7807 problem-details error body from the backend. */
type ProblemDetails = {
  type?: string
  title?: string
  detail?: string
  status?: number
}

/** ApiError carries the HTTP status and a human message parsed from the body. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiFetchInit = RequestInit & {
  token?: string | null
  revalidate?: number
}

/**
 * apiFetch calls the bokarn backend. On a non-2xx response it throws an
 * ApiError carrying the status and the problem-details message, so a caller
 * never has to inspect a response object to find out whether it failed.
 */
export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit,
): Promise<T> {
  const { token, revalidate, ...rest } = init ?? {}

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(rest.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    ...(revalidate === undefined ? {} : { next: { revalidate } }),
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as ProblemDetails
      message = body.detail ?? body.title ?? message
    } catch {
      // A non-JSON error body leaves the status text as the message.
    }
    throw new ApiError(res.status, message)
  }

  // 204 and an empty body are valid successful answers; parsing them as JSON
  // would turn a successful DELETE into a thrown SyntaxError.
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }

  return (await res.json()) as T
}
