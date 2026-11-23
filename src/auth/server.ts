import 'server-only'

import { betterAuth } from 'better-auth'

import { authOptions } from './options'

/** Better-Auth-Instanz der Website (nur serverseitig). */
export const auth = betterAuth(authOptions)
export { isEduidConfigured } from './options'
