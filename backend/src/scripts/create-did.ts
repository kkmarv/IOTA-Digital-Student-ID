import {
  Account, AccountBuilder, Client, Document, ExplorerUrl, KeyPair, KeyType
} from "@iota/identity-wasm/node/identity_wasm.js"
import cfg from "../config.js"

async function createIdentity(): Promise<Account> {
  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig)
  const account = await builder.createIdentity()
  await account.publish()

  console.log(account.document())

  return account
}

createIdentity()