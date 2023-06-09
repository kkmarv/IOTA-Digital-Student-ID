import { Stronghold } from '@iota/identity-stronghold-nodejs'
import identity from '@iota/identity-wasm/node/identity_wasm.js'
import assert from 'assert'
import { env } from 'process'

const apiVersion = 0
const apiBase = `/api/v${apiVersion}`
const urlRegex = /^(http|https):\/\/.*/
const strongholdPath = './identity.hodl'

export const apiPort = 8080
export const websocketPort = 3000

/** API routes */
export const routes = {
  challenge: apiBase + '/challenge',
  studentIDCredentialRequirements: apiBase + '/credential/student/requirements',
  issueStudentIDCredential: apiBase + '/credential/student/issue',
} as const

export const failureReasons = {} as const

export const startSummerSemester = env.START_SUMMER_SEMESTER || '04-01' // April 1st
export const startWinterSemester = env.START_WINTER_SEMESTER || '10-01' // October 1st

/** Types of Verifiable Credentials */
export const credentialTypes = {
  studentID: 'StudentIDCredential',
  nationalID: 'NationalIDCredential',
} as const

// Declare all required environment variables here
assert(env.AUTHORITY_DID, 'Please specify a DID.')
assert(env.AUTHORITY_SEED, 'Please specify a password.')
assert(env.AUTHORITY_NAME, 'Please specify an institution name.')
assert(env.AUTHORITY_WEBSITE, 'Please specify a website that represents the institution.')

// Website must be a valid URL
assert(urlRegex.test(env.AUTHORITY_WEBSITE), 'Website must be a valid URL starting with http:// or https://.')

// DID must be a valid DID
try {
  identity.DID.parse(env.AUTHORITY_DID)
} catch (err) {
  assert(false, 'Given DID is not a valid DID.')
}

// Stronghold must exist and contain the DID
export const stronghold = await Stronghold.build(strongholdPath, env.AUTHORITY_SEED)
assert(stronghold.didExists(identity.DID.parse(env.AUTHORITY_DID)), 'Given DID does not exist in Stronghold.')

// Validate network name
if (env.AUTHORITY_NETWORK) {
  try {
    identity.Network.tryFromName(env.AUTHORITY_NETWORK)
  } catch (err) {
    assert(false, 'Given network is not a valid network.')
  }
}

/** Authority configuration. */
export const authorityConfig = {
  did: identity.DID.parse(env.AUTHORITY_DID),
  seed: env.AUTHORITY_SEED,
  name: env.AUTHORITY_NAME,
  website: env.AUTHORITY_WEBSITE,
  serviceFragments: { website: 'website' },
  methodFragments: {
    signChallenge: 'key-sign-challenge',
    signStudentIDCredential: 'key-sign-student-id-credential',
  },
  proofExpiryDuration: env.AUTHORITY_PROOF_DURATION
    ? identity.Duration.minutes(parseInt(env.AUTHORITY_PROOF_DURATION, 10))
    : identity.Duration.minutes(10),
} as const

/** IOTA client configuration used to connect to the Tangle. */
export const clientConfig: identity.IClientConfig = {
  network: env.AUTHORITY_NETWORK ? identity.Network.tryFromName(env.AUTHORITY_NETWORK) : identity.Network.devnet(),
  primaryNode: env.AUTHORITY_PRIMARY_NODE_URL ? { url: env.AUTHORITY_PRIMARY_NODE_URL } : undefined,
} as const

/** IOTA AccountBuilder configuration used to create the authority's account. */
export const accountBuilderConfig: identity.AccountBuilderOptions = {
  autosave: identity.AutoSave.every(),
  autopublish: false,
  storage: stronghold,
  clientConfig: clientConfig,
} as const
