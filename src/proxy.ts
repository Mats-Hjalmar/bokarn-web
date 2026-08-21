import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, isLocale } from '@/lib/i18n'

/**
 * Every guest route is locale-scoped. A request without one is redirected to
 * the default locale rather than served an unlabelled page, so a shared link
 * always carries the language it was read in.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = pathname.split('/')[1]
  if (isLocale(first)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
