import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/auth/server'

/** Endpunkte der Mitgliederkonten (Better Auth) unter /api/auth/* – neben der Payload-API. */
export const { GET, POST } = toNextJsHandler(auth)
