import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { DependencyList, fetchHealth, type Health } from '@/features/status'
import { getDictionary, isLocale } from '@/lib/i18n'
import { tenantSlugFromHost } from '@/lib/tenant/host'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const slug = tenantSlugFromHost((await headers()).get('host'))

  let health: Health | null = null
  try {
    health = await fetchHealth()
  } catch {
    // A dead API is the thing this page exists to show, so it renders the
    // unreachable state rather than failing the route.
    health = null
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 p-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t.app.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.app.tagline}</p>
        <p className="text-muted-foreground mt-4 font-mono text-xs">
          tenant: {slug ?? '—'}
        </p>
      </header>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-sm font-medium">{t.status.heading}</h2>
        <DependencyList health={health} t={t} />
      </section>
    </main>
  )
}
