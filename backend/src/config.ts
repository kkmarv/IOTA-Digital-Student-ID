import assert from 'assert'
import { AutoSave, DID, Duration, Network } from '@iota/identity-wasm/node/identity_wasm'


// Ensure that the env variables are defined and of valid format.
assert(process.env.DID_URL, 'Please specify a DID.')
assert(process.env.PRIVATE_KEY, 'Please specify a private key.')
assert(process.env.INSTITUTION_NAME, 'Please specify an institution name.')
assert(DID.parse(process.env.DID_URL))

// The Tangle network to use.
const tangle = process.env.IDENTITY_NETWORK ? Network.tryFromName(process.env.IDENTITY_NETWORK) : Network.devnet()


const config = {
  // Expose the Web service on this port.
  webPort: 80,
  // Expose the API service on this port.
  apiPort: 8080,
  /// Your DID.
  didUrl: DID.parse(process.env.DID_URL),
  // The private key to your DID.
  privateKey: process.env.PRIVATE_KEY,
  // The official name of the institution which will be issuing credentials
  identityName: process.env.INSTITUTION_NAME,
  // The first day of the summer semester.
  ssStart: process.env.SS_START || '01-04',
  // The first day of the winter semester.
  wsStart: process.env.WS_START || '01-10',
  // Development mode ("development" is used for debug)
  devMode: process.env.NODE_ENV && process.env.NODE_ENV === 'development' ? true : false,
  // The Tangle network to use.
  network: tangle,
  // How long proofs from your identity will be valid. Duration in minutes.
  proofDuration: process.env.PROOF_DURATION ?
    Duration.minutes(parseInt(process.env.PROOF_DURATION, 10)) : Duration.minutes(10),
  // Options for creating and publishing the local DID.
  accountBuilder: {
    autosave: AutoSave.never(),
    autopublish: false,
    clientConfig: { network: tangle }
  }
} as const

export default config
