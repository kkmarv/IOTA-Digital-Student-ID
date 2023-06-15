import identity from '@iota/identity-wasm/node/identity_wasm.js'
import assert from 'assert'
import { env } from 'process'

// Declare all required environment variables here
assert(env.AUTHORITY_DID, 'Please specify a DID.')
assert(env.AUTHORITY_SEED, 'Please specify a password.')
assert(env.AUTHORITY_NAME, 'Please specify an institution name.')
assert(env.AUTHORITY_WEBSITE, 'Please specify a website that represents the institution.')

// Declare optional environment variables here
export const startSummerSemester = env.START_SUMMER_SEMESTER || '04-01' // April 1st
export const startWinterSemester = env.START_WINTER_SEMESTER || '10-01' // October 1st
export const challengeSize = env.AUTHORITY_CHALLENGE_SIZE ? parseInt(env.AUTHORITY_CHALLENGE_SIZE, 10) : 64
export const challengeTimeout = env.AUTHORITY_CHALLENGE_TIMEOUT
  ? parseInt(env.AUTHORITY_CHALLENGE_TIMEOUT, 10)
  : 1000 * 60 * 10 // 10 minutes

// Validate: Website must be a valid URL
const urlRegex = /^(http|https):\/\/.*/
assert(urlRegex.test(env.AUTHORITY_WEBSITE), 'Website must be a valid URL starting with http:// or https://.')

// Validate: DID must be a valid DID from the IOTA DID scheme
try {
  identity.DID.parse(env.AUTHORITY_DID)
} catch (err) {
  assert(false, 'Given DID is not a valid IOTA DID.')
}

// Validate: Network name
if (env.AUTHORITY_NETWORK) {
  try {
    identity.Network.tryFromName(env.AUTHORITY_NETWORK)
  } catch (err) {
    assert(false, 'Given network is not a valid network.')
  }
}

// Validate: Proof duration is an integer and a valid duration
if (env.AUTHORITY_PROOF_DURATION) {
  try {
    identity.Duration.minutes(parseInt(env.AUTHORITY_PROOF_DURATION, 10))
  } catch (err) {
    assert(false, 'Given proof duration is not a valid duration.')
  }
}

/** Environment variables. Parsed and validated. */
const validatedEnvVars = {
  authorityDid: env.AUTHORITY_DID!,
  authoritySeed: env.AUTHORITY_SEED!,
  authorityName: env.AUTHORITY_NAME!,
  authorityWebsite: env.AUTHORITY_WEBSITE!,
  authorityNetwork: env.AUTHORITY_NETWORK,
  authorityProofDuration: parseInt(env.AUTHORITY_PROOF_DURATION!, 10),
}

export default validatedEnvVars
