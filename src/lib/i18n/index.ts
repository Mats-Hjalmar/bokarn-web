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
