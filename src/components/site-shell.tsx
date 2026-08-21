import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { locales, type Dictionary, type Locale } from '@/lib/i18n'

/**
 * The frame every guest page sits in.
 *
 * It carries the operator's own name and nothing of bokarn's. A campsite's
 * booking page is the campsite's shopfront, and putting a vendor's brand across
 * the top of it is the fastest way to make an operator feel like a tenant of
 * their own website.
 */
export function SiteShell({
  siteName,
  municipality,
  locale,
  t,
  children,
}: {
  siteName: string
  municipality?: string
  locale: Locale
  t: Dictionary
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={`/${locale}`} className="group min-w-0">
            <span className="block truncate text-lg font-semibold tracking-tight">
              {siteName}
            </span>
            {municipality ? (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <MapPin className="size-3" aria-hidden />
                {municipality}
              </span>
            ) : null}
          </Link>

          <nav aria-label={t.nav.language} className="flex items-center gap-1">
            {locales.map((code) => (
              <Link
                key={code}
                href={`/${code}`}
                aria-current={code === locale ? 'true' : undefined}
                className={
                  code === locale
                    ? 'bg-accent text-accent-foreground rounded-md px-2 py-1 text-xs font-medium uppercase'
                    : 'text-muted-foreground hover:text-foreground rounded-md px-2 py-1 text-xs font-medium uppercase'
                }
              >
                {code}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto max-w-5xl px-4 py-6 text-xs sm:px-6">
          {siteName}
          {municipality ? ` · ${municipality}` : ''}
        </div>
      </footer>
    </div>
  )
}
