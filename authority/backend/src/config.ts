import { Stronghold } from '@iota/identity-stronghold-nodejs'
import identity from '@iota/identity-wasm/node/identity_wasm.js'
import assert from 'assert'
import { env } from 'process'

const API_VERSION = 0
export const API_PORT = 8080
export const API_BASE = `/api/v${API_VERSION}`
export const WEBSOCKET_PORT = 3000

export const START_SUMMER_SEMESTER = env.START_SUMMER_SEMESTER || '04-01'
export const START_WINTER_SEMESTER = env.START_WINTER_SEMESTER || '10-01'

export const ROUTES = {
  challenge: API_BASE + '/challenge',
  needForCredential: API_BASE + '/credential/student/prerequisite',
  issueCredential: API_BASE + '/credential/student/issue',
}

export const FAILURE_REASONS = {}

/* Begin environment variable validation */
assert(env.AUTHORITY_DID, 'Please specify a DID.')
assert(env.AUTHORITY_SEED, 'Please specify a password.')
assert(env.AUTHORITY_NAME, 'Please specify an institution name.')
assert(env.AUTHORITY_WEBSITE, 'Please specify a website that represents the institution.')

try {
  identity.DID.parse(env.AUTHORITY_DID)
} catch (err) {
  assert(false, 'Given DID is not a valid DID.')
}

const strongholdPath = './identity.hodl'
export const STRONGHOLD = await Stronghold.build(strongholdPath, env.AUTHORITY_SEED)
assert(STRONGHOLD.didExists(identity.DID.parse(env.AUTHORITY_DID)), 'Given DID does not exist in Stronghold.')

if (env.AUTHORITY_NETWORK) {
  try {
    identity.Network.tryFromName(env.AUTHORITY_NETWORK)
  } catch (err) {
    assert(false, 'Given network is not a valid network.')
  }
}
/* End of environment variable validation */

export const AUTHORITY_CONFIG = {
  did: identity.DID.parse(env.AUTHORITY_DID),
  seed: env.AUTHORITY_SEED,
  name: env.AUTHORITY_NAME,
  website: env.AUTHORITY_WEBSITE,
  proofExpiryDuration: env.AUTHORITY_PROOF_DURATION
    ? identity.Duration.minutes(parseInt(env.AUTHORITY_PROOF_DURATION, 10))
    : identity.Duration.minutes(10),
}

export const CLIENT_CONFIG: identity.IClientConfig = {
  network: env.AUTHORITY_NETWORK ? identity.Network.tryFromName(env.AUTHORITY_NETWORK) : identity.Network.devnet(),
  primaryNode: env.AUTHORITY_PRIMARY_NODE_URL ? { url: env.AUTHORITY_PRIMARY_NODE_URL } : undefined,
}

export const ACCOUNT_BUILDER_CONFIG: identity.AccountBuilderOptions = {
  autosave: identity.AutoSave.every(),
  autopublish: false,
  storage: STRONGHOLD,
  clientConfig: CLIENT_CONFIG,
}
