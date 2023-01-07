import assert from 'assert'
import { AutoSave, DID, Duration, Network } from '@iota/identity-wasm/node/identity_wasm.js'
import { Stronghold } from '@iota/identity-stronghold-nodejs'
import { urlRegex } from './globals.js'


// Silence all console logs when not in dev mode
if (process.env.NODE_ENV !== 'development') console.log = function () { }

// Ensure that all required env variables are defined and of valid format.
assert(process.env.STRONGHOLD_PASS, 'Please specify a password.')
assert(process.env.INSTITUTION_NAME, 'Please specify an institution name.')
assert(process.env.INSTITUTION_WEBSITE, 'Please specify a website that represents the institution.')
assert(process.env.INSTITUTION_WEBSITE.match(urlRegex), 'Given website could not be parsed as a valid URL.')
if (process.env.PRIMARY_NODE_URL !== undefined) {
  assert(process.env.PRIMARY_NODE_URL.match(urlRegex), 'Primary node URL is not a valid URL.')
}

// Build the Stronghold storage
const strongholdPath = process.env.STRONGHOLD_PATH || './identity.hodl'
const stronghold = await Stronghold.build(strongholdPath, process.env.STRONGHOLD_PASS)

// Parse the DID and check if it exists in Stronghold
const didUrl = process.env.INSTITUTION_DID ? DID.parse(process.env.INSTITUTION_DID) : undefined
if (didUrl) {
  assert(stronghold.didExists(didUrl), "Given DID does not exist in Stronghold.")
}

// Options for connecting to the Tangle network.
const tangleClient = {
  // The Tangle network to use.
  network: process.env.INSTITUTION_NETWORK ? Network.tryFromName(process.env.INSTITUTION_NETWORK) : Network.devnet(),
  // The node to use for Tangle operations - defaults to load balancer if undefined.
  primaryNode: process.env.PRIMARY_NODE_URL ? { url: process.env.PRIMARY_NODE_URL } : undefined
}

const cfg = {
  // Expose the Web service on this port.
  webPort: 80,
  // Expose the API service on this port.
  apiPort: 8080,
  // The first day of the summer semester.
  ssStart: process.env.SS_START || '01-04',
  // The first day of the winter semester.
  wsStart: process.env.WS_START || '01-10',
  // Development mode ("development" is used for debug)
  devMode: process.env.NODE_ENV && process.env.NODE_ENV === 'development' ? true : false,
  institution: {
    // Your DID.
    did: didUrl,
    // The official name of the institution which will be issuing credentials
    name: process.env.INSTITUTION_NAME,
    // A website that officially represents the institution on the web.
    website: process.env.INSTITUTION_WEBSITE
  },
  iota: {
    // Options for connecting to the Tangle network.
    clientConfig: tangleClient,
    // How long proofs from your identity will be valid. Duration in minutes.
    proofDuration: process.env.PROOF_DURATION ?
      Duration.minutes(parseInt(process.env.PROOF_DURATION, 10)) :
      Duration.minutes(10),
    // Options for creating and publishing local DIDs.
    accountBuilderConfig: {
      autosave: AutoSave.every(), // do not woooooooork Ò_Ó 
      autopublish: false,
      storage: stronghold,
      clientConfig: tangleClient
    },
    stronghold: {
      // The path of the stronghold file
      path: strongholdPath,
      // The password to the stronghold file containing the DID private key.
      pass: process.env.STRONGHOLD_PASS,
    }
  }
}

export default cfg