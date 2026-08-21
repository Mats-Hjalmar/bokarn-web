'use server'

import { cookies } from 'next/headers'
import { KRATOS_URL } from '@/lib/config'

/**
 * Registration runs server-side against Kratos's API-type flow.
 *
 * The browser never talks to Kratos directly. Each operator is its own
 * hostname, so a browser flow would need Kratos to redirect back to whichever
 * campsite the guest came from, and a static ui_url cannot know that. An
 * API-type flow hands the session token to this server instead, which puts it
 * in a cookie the browser can use — and keeps the whole exchange out of reach of
 * anything running on the page.
 */
export type RegisterResult = { ok: true } | { ok: false; message: string }

const guestSessionCookie = 'bokarn_guest_session'

type FlowNode = {
  messages?: { text?: string }[]
}

type Flow = {
  id?: string
  ui?: { messages?: { text?: string }[]; nodes?: FlowNode[] }
  error?: { message?: string }
  session_token?: string
}

export async function register(
  email: string,
  password: string,
): Promise<RegisterResult> {
  if (!email.includes('@') || password.length < 8) {
    return { ok: false, message: 'invalid' }
  }

  let flow: Flow
  try {
    const started = await fetch(`${KRATOS_URL}/self-service/registration/api`, {
      cache: 'no-store',
    })
    flow = (await started.json()) as Flow
  } catch {
    return { ok: false, message: 'unreachable' }
  }

  if (!flow.id) return { ok: false, message: 'unreachable' }

  const submitted = await fetch(
    `${KRATOS_URL}/self-service/registration?flow=${flow.id}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'password',
        password,
        traits: { email },
      }),
      cache: 'no-store',
    },
  )

  const body = (await submitted.json()) as Flow

  if (!submitted.ok || !body.session_token) {
    // Kratos puts the reason in the flow's own messages. Surfacing its text
    // rather than a generic failure is what lets a guest see "that address is
    // already registered" instead of guessing.
    return { ok: false, message: firstMessage(body) }
  }

  // Scoped to this operator's hostname by virtue of being set from it, and
  // http-only because nothing on the page has any business reading it.
  const store = await cookies()
  store.set(guestSessionCookie, body.session_token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  return { ok: true }
}

function firstMessage(flow: Flow): string {
  const fromUI = flow.ui?.messages?.[0]?.text
  if (fromUI) return fromUI
  for (const node of flow.ui?.nodes ?? []) {
    const text = node.messages?.[0]?.text
    if (text) return text
  }
  return flow.error?.message ?? 'failed'
}
