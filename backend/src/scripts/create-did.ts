import { Account, AccountBuilder } from "@iota/identity-wasm/node/identity_wasm.js"
import cfg from "../config.js"

/**
 * Create a new DID, save it to a Stronghold file and publish to the Tangle.
 * @returns The account of the newly created DID.
 */
async function createIdentity(): Promise<Account> {
  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig)
  const account = await builder.createIdentity()

  // Wait for all unpublished changes to get included in a Tangle message.
  await account.publish()
  console.log(account.document())

  return account
}

createIdentity()