import { Account, AccountBuilder, DID } from "@iota/identity-wasm/node/identity_wasm.js";
import { exit } from "process";
import cfg from "../config.js";

async function loadDID(did: DID): Promise<Account> {
  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig)
  const account = await builder.loadIdentity(did)

  console.dir(account.document().toJSON());
  return account
}

const arg = process.argv[2]
if (!arg) {
  console.log("Please specify a DID as first argument");
  exit()
}
const did = DID.parse(arg)

loadDID(did)