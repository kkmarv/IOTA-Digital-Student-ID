import { Account, AccountBuilder, AccountBuilderOptions, AutoSave, KeyPair, KeyType } from "@iota/identity-wasm/node/identity_wasm.js"
import { exit } from "process"
import cfg from "../config.js"

/**
 * Create a new DID and save it to a Stronghold file.
 * @param forcePublishing Wether to publish to the Tangle. Defaults to true.
 * @returns The account of the newly created DID.
 */
async function createIdentity(privateKey?: Uint8Array, forcePublishing = true): Promise<Account> {
  let keyPair;
  if (privateKey) {
    keyPair = KeyPair.tryFromPrivateKeyBytes(KeyType.Ed25519, privateKey);
    console.log(`Public Key: ${keyPair.public}`);
    console.log(`Private Key: ${keyPair.private}`);
  }

  const builder = new AccountBuilder(options)
  const account = await builder.createIdentity()


  if (forcePublishing) await account.publish()
  console.log(account.document().toJSON())

  return account
}

if (!process.argv[2]) {
  console.log("Please specify 'stronghold' or 'console' as first argument.");
  exit()
}

const options: AccountBuilderOptions = {
  autosave: cfg.iota.accountBuilderConfig.autosave,
  autopublish: cfg.iota.accountBuilderConfig.autopublish,
  clientConfig: cfg.iota.clientConfig
};

const privateKey = process.argv[2] ? new TextEncoder().encode(process.argv[2]) : undefined

createIdentity(privateKey)