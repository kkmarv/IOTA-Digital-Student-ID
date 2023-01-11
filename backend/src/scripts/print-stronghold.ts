import { DID } from "@iota/identity-wasm/node/identity_wasm.js"
import cfg from "../config.js"

// ANSI codes
const RESET = "\x1b[0m"
const GRAY_FG = "\x1b[90m"
const BRIGHT = "\x1b[1m"

async function isPublished(did: DID): Promise<boolean> {
  const stronghold = cfg.iota.accountBuilderConfig.storage
  const chainState = await stronghold.chainStateGet(did)

  // Check if output of chainState has any entries i.e. the DID is pushed onto the Tangle
  return chainState && Object.keys(chainState.toJSON()).length === 0 ? false : true
}

/**
 * Print all DIDs contained in the local Stronghold storage.
 * DIDs written in white are published while greys are not.
 */
async function printStronghold(): Promise<void> {
  const stronghold = cfg.iota.accountBuilderConfig.storage

  // Retrieve all DIDs stored in the Stronghold.
  const didList: DID[] = await stronghold.didList()

  let count = 0
  for (let did of didList) {
    let color = RESET + BRIGHT
    await isPublished(did) ? count++ : color = GRAY_FG
    console.log(`${color}${did.toString()}`);
  }

  console.log(`${RESET}Stronghold contains ${didList.length} entries of which ${count} are published.`)
}

printStronghold()