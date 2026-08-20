import { apiFetch } from '@/lib/api/client'

export type Health = {
  status: string
  postgres: string
  redis: string
  kratos: string
}

export function fetchHealth(): Promise<Health> {
  return apiFetch<Health>('/healthz', { cache: 'no-store' })
}
