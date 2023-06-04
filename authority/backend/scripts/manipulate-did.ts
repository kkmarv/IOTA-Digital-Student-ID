import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { exit } from 'process'
import { ACCOUNT_BUILDER_CONFIG, STRONGHOLD } from '../src/config.js'

/**
 * Manipulate a DID by inserting an example service into its document.
 * Beware that it has to publish the DID or otherwise the account
 * implementation will not save changes to the Stronghold.
 * @param did The DID serving as an example.
 */
async function manipulateIdentity(did: identity.DID): Promise<void> {
  if (!(await STRONGHOLD.didExists(did))) {
    return console.log('DID does not exist in Stronghold.')
  }

  const builder = new identity.AccountBuilder(ACCOUNT_BUILDER_CONFIG)
  const account = await builder.loadIdentity(did)

  // Add a new service to the identity.
  await account.createService({
    fragment: 'my-service-1',
    type: 'MyCustomServiceProvingManipulationWorks',
    endpoint: 'https://example.com',
  })

  // Important: The account won't save changes to the Stronghold that aren't on the Tangle (But why?)
  await account.publish()

  console.dir(account.document().toJSON(), { depth: null })
}

if (!process.argv[2]) {
  console.log('Please specify a DID as first argument')
  exit()
}

manipulateIdentity(identity.DID.parse(process.argv[2]))
