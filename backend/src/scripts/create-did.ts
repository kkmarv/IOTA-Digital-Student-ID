import { AccountBuilder, KeyPair, KeyType } from "@iota/identity-wasm/node/identity_wasm.js"
import cfg from "../config.js"
import { encode } from "./base58.js"

/**
 * Create a new DID and save it to a Stronghold file.
 * @param forcePublishing Wether to publish to the Tangle. Defaults to true.
 * @returns The account of the newly created DID.
 */
async function createIdentity() {
  const keyPair = new KeyPair(KeyType.Ed25519)

  console.log(`Public Key: ${encode(keyPair.public())}`)
  console.log(`Private Key: ${encode(keyPair.private())}`)

  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig)
  const account = await builder.createIdentity({ privateKey: keyPair?.private() })

  await account.publish()
  console.dir(account.document().toJSON(), { depth: null })

  return account
}

createIdentity()