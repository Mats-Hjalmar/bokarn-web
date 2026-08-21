import { money, shortDate } from '@/lib/format'
import type { Dictionary, Locale } from '@/lib/i18n'
import type { QuoteLine, QuoteTotals } from '../types'

/**
 * What to call a line.
 *
 * Two kinds of wording end up in a breakdown. A rate plan, a campaign and a
 * dynamic-pricing rule are named by the operator, and those names pass through
 * untouched — they are the campsite talking to its guest. A length-of-stay
 * discount and a capped discount are the engine talking, and the engine has no
 * language, so those are labelled from the dictionary instead of showing
 * whatever string happened to be compiled in.
 */
function label(line: QuoteLine, t: Dictionary): string {
  return t.book.lineKinds[line.kind] ?? line.description
}

/**
 * The breakdown, line by line, with VAT on each.
 *
 * Per-line VAT is shown rather than one figure at the bottom because the lines
 * genuinely carry different rates — accommodation at 12%, a pet fee at 25% —
 * and a single number would hide that a fee is taxed differently from the pitch
 * it is attached to.
 */
export function PriceTable({
  lines,
  totals,
  locale,
  t,
}: {
  lines: QuoteLine[]
  totals: QuoteTotals
  locale: Locale
  t: Dictionary
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-md text-sm">
        <caption className="sr-only">{t.book.breakdown}</caption>
        <thead>
          <tr className="text-muted-foreground border-b text-left text-xs">
            <th scope="col" className="py-2 pr-4 font-medium">
              {t.book.line}
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">
              {t.book.vat}
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              {t.book.amount}
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.seq} className="border-b last:border-0">
              <td className="py-2 pr-4">
                <span>{label(line, t)}</span>
                {line.stay_date ? (
                  <span className="text-muted-foreground">
                    {' · '}
                    {shortDate(line.stay_date, locale)}
                  </span>
                ) : null}
              </td>
              <td className="text-muted-foreground py-2 pr-4 text-right tabular-nums">
                {money(line.vat_minor, totals.currency, locale)}
                <span className="ml-1 text-xs">
                  ({line.vat_rate_bp / 100}%)
                </span>
              </td>
              <td className="py-2 text-right tabular-nums">
                {money(line.gross_minor, totals.currency, locale)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2">
            <th scope="row" className="py-3 pr-4 text-left font-semibold">
              {t.book.total}
            </th>
            <td className="text-muted-foreground py-3 pr-4 text-right tabular-nums">
              {money(totals.vat_minor, totals.currency, locale)}
            </td>
            <td className="py-3 text-right text-base font-semibold tabular-nums">
              {money(totals.gross_minor, totals.currency, locale)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
