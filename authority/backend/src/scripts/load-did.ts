import { AccountBuilder, DID } from '@iota/identity-wasm/node'
import { exit } from 'process'
import config from '../config.js'

/**
 * Load a DID from the local Stronghold storage.
 * @param did The DID to load.
 * @returns The account of the loaded DID, if found. Throws Error otherwise.
 */
async function loadDID(did: DID): Promise<void> {
  if (!(await config.iota.accountBuilderConfig.storage.didExists(did))) {
    console.log('DID does not exist in Stronghold.')
    return
  }

  const builder = new AccountBuilder(config.iota.accountBuilderConfig)
  const account = await builder.loadIdentity(did)

  console.dir(account.document().toJSON(), { depth: null })
}

if (!process.argv[2]) {
  console.log('Please specify a DID as first argument')
  exit()
}

loadDID(DID.parse(process.argv[2]))
