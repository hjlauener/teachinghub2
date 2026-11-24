'use client'

import { passkeyClient } from '@better-auth/passkey/client'
import { magicLinkClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

/** Client der Mitgliederkonten (gleicher Ursprung, Basis /api/auth). */
export const authClient = createAuthClient({ plugins: [magicLinkClient(), passkeyClient()] })

/**
 * Anmeldung über edu-ID (Generic OAuth, Phase 7): Better Auth führt OIDC-Anbieter als „social provider“;
 * die Antwort enthält die Weiterleitung zum Anmeldedienst.
 */
export async function signInWithEduid(callbackURL: string, errorCallbackURL: string) {
  const { data, error } = await authClient.signIn.social({ provider: 'eduid', callbackURL, errorCallbackURL, disableRedirect: true })
  if (error || !data?.url) return error ?? new Error('Keine Weiterleitung erhalten')
  window.location.assign(data.url)
  return null
}

/** Bestehendes Konto bewusst mit der edu-ID verknüpfen (Seite „Mein Konto“). */
export async function linkEduid(callbackURL: string, errorCallbackURL: string) {
  const { data, error } = await authClient.linkSocial({ provider: 'eduid', callbackURL, errorCallbackURL, disableRedirect: true })
  if (error || !data?.url) return error ?? new Error('Keine Weiterleitung erhalten')
  window.location.assign(data.url)
  return null
}
