import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { exit } from 'process'
import { ACCOUNT_BUILDER_CONFIG, STRONGHOLD } from '../src/config.js'

/**
 * Load a DID from the local Stronghold storage.
 * @param did The DID to load.
 * @returns The account of the loaded DID, if found. Throws Error otherwise.
 */
async function loadDID(did: identity.DID): Promise<void> {
  if (!(await STRONGHOLD.didExists(did))) {
    return console.log('DID does not exist in Stronghold.')
  }

  const builder = new identity.AccountBuilder(ACCOUNT_BUILDER_CONFIG)
  const account = await builder.loadIdentity(did)

  console.dir(account.document().toJSON(), { depth: null })
}

if (!process.argv[2]) {
  console.log('Please specify a DID as first argument')
  exit()
}

loadDID(identity.DID.parse(process.argv[2]))
