import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { exit } from 'process'
import { stronghold } from '../../src/config.js'

async function deleteDID(did: identity.DID) {
  const purged = await stronghold.didPurge(did)
  purged ? console.log(`DID purged from Stronghold successfully`) : console.log(`DID not found in Stronghold`)
}

if (!process.argv[2]) {
  console.log('Please specify a DID as first argument')
  exit()
}

deleteDID(identity.DID.parse(process.argv[2]))
