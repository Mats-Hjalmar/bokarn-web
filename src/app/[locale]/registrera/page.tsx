import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/site-shell'
import { RegisterForm } from '@/features/account'
import { currentOperator } from '@/features/booking/operator'
import { getDictionary, isLocale } from '@/lib/i18n'
import { UnknownOperator } from '../unknown-operator'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const operator = await currentOperator()
  if (!operator) return <UnknownOperator locale={locale} t={t} />

  const { email } = await searchParams

  return (
    <SiteShell
      siteName={operator.site.name}
      municipality={operator.site.municipality}
      locale={locale}
      t={t}
    >
      <div className="grid max-w-xl gap-6">
        <header className="grid gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.register.heading}
          </h1>
          <p className="text-muted-foreground text-sm">{t.register.intro}</p>
        </header>
        <RegisterForm defaultEmail={email ?? ''} t={t} />
      </div>
    </SiteShell>
  )
}
