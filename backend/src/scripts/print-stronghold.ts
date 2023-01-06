import { Stronghold } from "@iota/identity-stronghold-nodejs"
import { DID } from "@iota/identity-wasm/node/identity_wasm.js"
import cfg from "../config.js"

/**
 * Print all DIDs contained in the local Stronghold storage.
 */
async function printStronghold() {
  const stronghold = await Stronghold.build(cfg.iota.stronghold.path, cfg.iota.stronghold.pass)

  // Retrieve all DIDs stored in the Stronghold.
  const didList: DID[] = await stronghold.didList()

  didList.map((did: DID) => {
    console.log(did.toString());
  })

  console.log(`Stronghold contains ${didList.length} entries.`)
}

printStronghold()