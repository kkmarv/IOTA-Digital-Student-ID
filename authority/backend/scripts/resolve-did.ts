import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { exit } from 'process'
import { clientConfig } from '../src/config.js'

/**
 * Resolve a DID Document from the Tangle.
 * @param did The DID to resolve
 * @returns The ResolvedDocument of the DID.
 */
export async function resolveDID(did: identity.DID): Promise<identity.ResolvedDocument> {
  // Retrieve the published DID Document from the Tangle.
  const resolver = await identity.Resolver.builder().clientConfig(clientConfig).build()

  const doc = await resolver.resolve(did)
  console.log(doc.toJSON())

  return doc
}

if (!process.argv[2]) {
  console.log('Please specify a DID as first argument')
  exit()
}

resolveDID(identity.DID.parse(process.argv[2]))
