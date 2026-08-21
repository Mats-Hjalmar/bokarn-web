import 'server-only'

export const API_BASE_URL =
  process.env.BOKARN_API_URL ?? 'http://api.bokarn.localhost/api/v1'

export const KRATOS_URL =
  process.env.BOKARN_KRATOS_URL ?? 'http://auth.bokarn.localhost'
