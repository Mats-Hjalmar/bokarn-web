'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isoDay } from '@/lib/format'
import type { Dictionary, Locale } from '@/lib/i18n'
import { stayToParams, type StayQuery } from '../types'

/**
 * The search form writes the stay into the URL and lets the page re-render from
 * it, rather than holding it in a store.
 *
 * That is what makes a search bookmarkable, shareable and survivable by the back
 * button, and it means the price shown can never disagree with the query that
 * produced it — there is only one copy of the answer to "what did they ask
 * for?".
 */
export function SearchForm({
  initial,
  locale,
  t,
}: {
  initial: StayQuery
  locale: Locale
  t: Dictionary
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [arrival, setArrival] = useState(initial.arrival || isoDay(1))
  const [departure, setDeparture] = useState(initial.departure || isoDay(4))
  const [adults, setAdults] = useState(initial.adults)
  const [children, setChildren] = useState<string[]>(initial.children)
  const [pets, setPets] = useState(initial.pets)
  const [electricityAmp, setElectricityAmp] = useState(initial.electricityAmp)
  const [accessible, setAccessible] = useState(initial.accessible)

  // Departure has to stay after arrival, and moving arrival past it is a
  // natural thing to do. Pushing departure along is less surprising than
  // refusing the change or silently searching a negative stay.
  function changeArrival(value: string) {
    setArrival(value)
    if (value && departure <= value) {
      const next = new Date(`${value}T12:00:00`)
      next.setDate(next.getDate() + 1)
      setDeparture(next.toISOString().slice(0, 10))
    }
  }

  function setChildCount(count: number) {
    setChildren((current) => {
      if (count <= current.length) return current.slice(0, count)
      return [...current, ...Array(count - current.length).fill('')]
    })
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const stay: StayQuery = {
      arrival,
      departure,
      adults,
      // A child with no date of birth is dropped rather than counted: the age
      // band is what prices them, and a blank date would price a fifteen-year
      // old as a toddler.
      children: children.filter((value) => value !== ''),
      pets,
      electricityAmp,
      accessible,
    }
    startTransition(() => {
      router.push(`/${locale}?${stayToParams(stay)}`)
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.search.arrival} htmlFor="arrival">
          <Input
            id="arrival"
            type="date"
            required
            min={isoDay(0)}
            value={arrival}
            onChange={(event) => changeArrival(event.target.value)}
          />
        </Field>
        <Field label={t.search.departure} htmlFor="departure">
          <Input
            id="departure"
            type="date"
            required
            min={arrival || isoDay(1)}
            value={departure}
            onChange={(event) => setDeparture(event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t.search.adults} htmlFor="adults">
          <Input
            id="adults"
            type="number"
            min={1}
            max={12}
            value={adults}
            onChange={(event) =>
              setAdults(Math.max(1, Number(event.target.value)))
            }
          />
        </Field>
        <Field label={t.search.children} htmlFor="children">
          <Input
            id="children"
            type="number"
            min={0}
            max={8}
            value={children.length}
            onChange={(event) =>
              setChildCount(Math.max(0, Number(event.target.value)))
            }
          />
        </Field>
        <Field label={t.search.pets} htmlFor="pets">
          <Input
            id="pets"
            type="number"
            min={0}
            max={4}
            value={pets}
            onChange={(event) =>
              setPets(Math.max(0, Number(event.target.value)))
            }
          />
        </Field>
      </div>

      {children.length > 0 ? (
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">{t.search.childAges}</legend>
          <p className="text-muted-foreground text-xs">
            {t.search.childAgeHelp}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {children.map((value, index) => (
              <Input
                // The index is the identity here: these are positions in a
                // list of unnamed children, not entities with keys of their own.
                key={index}
                type="date"
                required
                max={isoDay(0)}
                aria-label={`${t.search.children} ${index + 1}`}
                value={value}
                onChange={(event) =>
                  setChildren((current) =>
                    current.map((item, at) =>
                      at === index ? event.target.value : item,
                    ),
                  )
                }
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="grid items-end gap-4 sm:grid-cols-2">
        <Field label={t.search.electricity} htmlFor="el">
          <div className="flex items-center gap-2">
            <Input
              id="el"
              type="number"
              min={0}
              max={32}
              step={1}
              value={electricityAmp}
              onChange={(event) =>
                setElectricityAmp(Math.max(0, Number(event.target.value)))
              }
            />
            <span className="text-muted-foreground text-sm">
              {t.search.amp}
            </span>
          </div>
        </Field>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <Checkbox
            checked={accessible}
            onCheckedChange={(value) => setAccessible(value === true)}
          />
          {t.search.accessible}
        </label>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="sm:w-fit">
        {pending ? t.search.searching : t.search.submit}
      </Button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
