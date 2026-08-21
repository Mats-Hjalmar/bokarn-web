import type { Dictionary } from '@/lib/i18n'

/**
 * The answer to a link that does not resolve.
 *
 * It says the same thing whether the reference is unknown, the token is wrong,
 * or the token has expired — deliberately. Telling an anonymous caller that a
 * reference exists but needs a token confirms the reference, and references are
 * short enough to guess.
 */
export function NotFoundNotice({ t }: { t: Dictionary }) {
  return (
    <div className="grid max-w-md gap-2">
      <h1 className="text-xl font-semibold tracking-tight">
        {t.booking.notFound}
      </h1>
      <p className="text-muted-foreground text-sm">{t.booking.notFoundHelp}</p>
    </div>
  )
}
