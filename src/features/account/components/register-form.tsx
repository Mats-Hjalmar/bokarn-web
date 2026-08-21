'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Dictionary } from '@/lib/i18n'
import { register } from '../actions'

export function RegisterForm({
  defaultEmail,
  t,
}: {
  defaultEmail: string
  t: Dictionary
}) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)

    const result = await register(
      String(form.get('email') ?? ''),
      String(form.get('password') ?? ''),
    )

    setSubmitting(false)
    if (result.ok) {
      setDone(true)
      return
    }
    // Kratos's own wording when it has some, the dictionary's when it does not.
    // Inventing a friendlier message would mean hiding "that address is already
    // registered", which is the one thing the guest needs to hear.
    setError(result.message === 'failed' ? t.register.failed : result.message)
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="text-primary size-4" aria-hidden />
        {t.register.done}
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="grid max-w-sm gap-4">
      {error ? (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex items-start gap-2 rounded-lg border p-3 text-sm"
        >
          <AlertCircle
            className="text-destructive mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          {error}
        </p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="email">{t.register.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">{t.register.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-muted-foreground text-xs">
          {t.register.passwordHelp}
        </p>
      </div>

      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? t.register.submitting : t.register.submit}
      </Button>
    </form>
  )
}
