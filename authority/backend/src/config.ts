import { Stronghold } from '@iota/identity-stronghold-nodejs'
import identity from '@iota/identity-wasm/node/identity_wasm.js'
import assert from 'assert'
import { env } from 'process'

const apiVersion = 0
export const apiPort = 8080
export const apiBase = `/api/v${apiVersion}/`
export const webSocketPort = 3000

export const strongholdPath = './identity.hodl'

export const startWinterSemester = env.START_SUMMER_SEMESTER || '04-01'
export const startSummerSemester = env.WS_START || '10-01'

const authorityDid = env.AUTHORITY_DID
const authoritySeed = env.AUTHORITY_SEED
const authorityName = env.AUTHORITY_NAME
const authorityWebsite = env.AUTHORITY_WEBSITE
const authorityNetwork = env.AUTHORITY_NETWORK
const authorityPrimaryNodeUrl = env.AUTHORITY_PRIMARY_NODE_URL
const authorityProofExpiryDuration = env.AUTHORITY_PROOF_DURATION

/* Begin environment variable validation */
assert(authorityDid, 'Please specify a DID.')
assert(authoritySeed, 'Please specify a password.')
assert(authorityName, 'Please specify an institution name.')
assert(authorityWebsite, 'Please specify a website that represents the institution.')

try {
  identity.DID.parse(authorityDid)
} catch (err) {
  assert(false, 'Given DID is not a valid DID.')
}

export const stronghold = await Stronghold.build(strongholdPath, authoritySeed)
assert(stronghold.didExists(identity.DID.parse(authorityDid)), 'Given DID does not exist in Stronghold.')

if (authorityNetwork) {
  try {
    identity.Network.tryFromName(authorityNetwork)
  } catch (err) {
    assert(false, 'Given network is not a valid network.')
  }
}
/* End of environment variable validation */

export const authority = {
  did: identity.DID.parse(authorityDid),
  seed: authoritySeed,
  name: authorityName,
  website: authorityWebsite,
  proofExpiryDuration: authorityProofExpiryDuration
    ? identity.Duration.minutes(parseInt(authorityProofExpiryDuration, 10))
    : identity.Duration.minutes(10),
}

export const clientConfig: identity.IClientConfig = {
  network: authorityNetwork ? identity.Network.tryFromName(authorityNetwork) : identity.Network.devnet(),
  primaryNode: authorityPrimaryNodeUrl ? { url: authorityPrimaryNodeUrl } : undefined,
}

export const accountBuilderConfig: identity.AccountBuilderOptions = {
  autosave: identity.AutoSave.every(),
  autopublish: false,
  storage: stronghold,
  clientConfig: clientConfig,
}
