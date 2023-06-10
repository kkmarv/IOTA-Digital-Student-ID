import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { accountBuilderConfig } from '../../src/config.js'
import { encode58 } from '../base58.js'

/** Create a new DID and save it to a Stronghold file. */
async function createIdentity(): Promise<void> {
  const keyPair = new identity.KeyPair(identity.KeyType.Ed25519)

  console.log(`Public Key: ${encode58(keyPair.public())}`)
  console.log(`Private Key: ${encode58(keyPair.private())}`)

  const builder = new identity.AccountBuilder(accountBuilderConfig)
  const account = await builder.createIdentity({ privateKey: keyPair.private() })

  console.log('Publishing DID document to the Tangle...')
  await account.publish()
  console.dir(account.document().toJSON(), { depth: null })
}

createIdentity()
