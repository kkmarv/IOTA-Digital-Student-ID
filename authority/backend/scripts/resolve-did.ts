import { DID, ResolvedDocument, Resolver } from '@iota/identity-wasm/node'
import { exit } from 'process'
import { clientConfig } from '../src/config.js'

/**
 * Resolve a DID Document from the Tangle.
 * @param did The DID to resolve
 * @returns The ResolvedDocument of the DID.
 */
export async function resolveDID(did: DID): Promise<ResolvedDocument> {
  // Retrieve the published DID Document from the Tangle.
  const resolver = await Resolver.builder().clientConfig(clientConfig).build()

  const doc = await resolver.resolve(did)
  console.log(doc.toJSON())

  return doc
}

if (!process.argv[2]) {
  console.log('Please specify a DID as first argument')
  exit()
}

resolveDID(DID.parse(process.argv[2]))
