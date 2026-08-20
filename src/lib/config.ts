import 'server-only'

export const API_BASE_URL =
  process.env.BOKARN_API_URL ?? 'http://localhost:1437/api/v1'

export const KRATOS_URL =
  process.env.BOKARN_KRATOS_URL ?? 'http://localhost:4633'
