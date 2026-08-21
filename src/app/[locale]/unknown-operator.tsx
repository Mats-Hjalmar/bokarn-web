import type { Dictionary, Locale } from '@/lib/i18n'

/**
 * Shown when the hostname names no operator we know.
 *
 * It is a plain page rather than a 404, because a guest who followed a link
 * from the campsite's own website needs to be told the address is wrong, not
 * that the page does not exist. And it deliberately shows no inventory at all:
 * picking an operator to display would be the multi-tenant leak this whole
 * design exists to prevent.
 */
export function UnknownOperator({
  locale,
  t,
}: {
  locale: Locale
  t: Dictionary
}) {
  return (
    <main
      lang={locale}
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 px-6 text-center"
    >
      <h1 className="text-xl font-semibold tracking-tight">
        {t.common.unknownOperator}
      </h1>
      <p className="text-muted-foreground text-sm">
        {t.common.unknownOperatorHelp}
      </p>
    </main>
  )
}
