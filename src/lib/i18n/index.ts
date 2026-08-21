import { de } from './dictionaries/de'
import { en } from './dictionaries/en'
import { sv } from './dictionaries/sv'

export const locales = ['sv', 'en', 'de'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'sv'

const dictionaries = { sv, en, de } as const

export type Dictionary = (typeof dictionaries)[Locale]

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

/**
 * A plural form as data rather than as a function.
 *
 * Dictionaries cross into client components, and React cannot serialise a
 * function — a dictionary with `nights: (n) => …` in it fails the whole page
 * with "Functions cannot be passed directly to Client Components". Storing the
 * forms and interpolating them here keeps every dictionary a plain object.
 *
 * Two forms is enough for sv, en and de, all of which distinguish only one from
 * many. A locale with more (Polish, Russian) needs Intl.PluralRules and a wider
 * shape; the type is where that change would land.
 */
export type Plural = { one: string; other: string }

export function plural(form: Plural, count: number): string {
  return fill(count === 1 ? form.one : form.other, { n: count })
}

/** Substitutes {name} placeholders. */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  )
}
