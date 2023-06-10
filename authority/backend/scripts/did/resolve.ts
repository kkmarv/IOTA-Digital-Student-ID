import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { exit } from 'process'
import { clientConfig } from '../../src/config.js'

/**
 * Resolve a DID document from the Tangle and print its document.
 * @param did The DID to resolve
 */
export async function resolveDID(did: identity.DID): Promise<void> {
  const resolver = await identity.Resolver.builder().clientConfig(clientConfig).build()

  console.log(`Searching for ${did.toString()} on the ${clientConfig.network?.toString()} network...`)

  try {
    const doc = await resolver.resolve(did)
    console.log(doc.toJSON())
  } catch (err) {
    console.log('DID not found ಠ_ಠ')
  }
}

if (!process.argv[2]) {
  console.log('Please specify a DID as first argument')
  exit()
}

resolveDID(identity.DID.parse(process.argv[2]))
