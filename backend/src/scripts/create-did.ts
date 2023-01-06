import { Account, AccountBuilder } from "@iota/identity-wasm/node/identity_wasm.js"
import cfg from "../config.js"

/**
 * Create a new DID and save it to a Stronghold file.
 * @param forcePublishing Wether to publish to the Tangle. Defaults to true.
 * @returns The account of the newly created DID.
 */
async function createIdentity(forcePublishing = true): Promise<Account> {
  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig)
  const account = await builder.createIdentity()

  if (forcePublishing) await account.publish()
  console.log(account.document().toJSON())

  return account
}

createIdentity()