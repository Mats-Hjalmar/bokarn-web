import type { Dictionary } from '@/lib/i18n'
import type { Health } from '../api'

export function DependencyList({
  health,
  t,
}: {
  health: Health | null
  t: Dictionary
}) {
  if (!health) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {t.status.unreachable}
      </p>
    )
  }

  const rows = [
    [t.status.postgres, health.postgres],
    [t.status.redis, health.redis],
    [t.status.kratos, health.kratos],
  ] as const

  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
      {rows.map(([label, state]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd
            className={
              state === 'ok'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }
          >
            {state === 'ok' ? t.status.ok : t.status.error}
          </dd>
        </div>
      ))}
    </dl>
  )
}
