'use client'

import { passkeyClient } from '@better-auth/passkey/client'
import { magicLinkClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

/** Client der Mitgliederkonten (gleicher Ursprung, Basis /api/auth). */
export const authClient = createAuthClient({ plugins: [magicLinkClient(), passkeyClient()] })

/** Anmeldung über edu-ID (Generic OAuth, Phase 7): Endpunkt liefert die Weiterleitungs-URL des Anbieters. */
export async function signInWithEduid(callbackURL: string, errorCallbackURL: string) {
  const { data, error } = await authClient.$fetch<{ url?: string }>('/sign-in/oauth2', {
    method: 'POST',
    body: { providerId: 'eduid', callbackURL, errorCallbackURL },
  })
  if (error || !data?.url) return error ?? new Error('Keine Weiterleitung erhalten')
  window.location.assign(data.url)
  return null
}
