import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { accountBuilderConfig } from '../src/config.js'
import { encode58 } from '../scripts/base58.js'

/**
 * Create a new DID and save it to a Stronghold file.
 * @param forcePublishing Wether to publish to the Tangle. Defaults to true.
 * @returns The account of the newly created DID.
 */
async function createIdentity() {
  const keyPair = new identity.KeyPair(identity.KeyType.Ed25519)

  console.log(`Public Key: ${encode58(keyPair.public())}`)
  console.log(`Private Key: ${encode58(keyPair.private())}`)

  const builder = new identity.AccountBuilder(accountBuilderConfig)
  const account = await builder.createIdentity({
    privateKey: keyPair?.private(),
  })

  await account.publish()
  console.dir(account.document().toJSON(), { depth: null })

  return account
}

createIdentity()
