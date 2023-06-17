import { Stronghold } from '@iota/identity-stronghold-nodejs'
import identity from '@iota/identity-wasm/node/identity_wasm.js'
import assert from 'assert'
import env from './env.config'

identity.start()

export const strongholdPath = './identity.hodl'

// Stronghold must exist and contain the DID
export const stronghold = await Stronghold.build(strongholdPath, env.authoritySeed)
assert(stronghold.didExists(identity.DID.parse(env.authorityDid)), 'Given DID does not exist in Stronghold.')

/** Authority configuration. */
export const authorityConfig = {
  did: identity.DID.parse(env.authorityDid),
  seed: env.authoritySeed,
  name: env.authorityName,
  website: env.authorityWebsite,
  serviceFragments: { website: 'website' },
  methodFragments: {
    signChallenge: 'key-sign-challenge',
    signStudentIDCredential: 'key-sign-student-id-credential',
  },
  proofExpiryDuration: env.authorityProofDuration
    ? identity.Duration.minutes(env.authorityProofDuration)
    : identity.Duration.minutes(10),
} as const

/** IOTA client configuration used to connect to the Tangle. */
export const clientConfig: identity.IClientConfig = {
  network: env.authorityNetwork ? identity.Network.tryFromName(env.authorityNetwork) : identity.Network.devnet(),
} as const

/** IOTA AccountBuilder configuration used to create the authority's account. */
export const accountBuilderConfig: identity.AccountBuilderOptions = {
  autosave: identity.AutoSave.every(),
  autopublish: false,
  storage: stronghold,
  clientConfig: clientConfig,
} as const
