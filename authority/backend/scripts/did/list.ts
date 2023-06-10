import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { stronghold } from '../../src/config.js'

// ANSI escapes for colored terminal output
const ANSI = {
  reset: '\x1b[0m',
  grayForeground: '\x1b[90m',
  bright: '\x1b[1m',
} as const

/** Check if a DID is published on the Tangle by looking for chainState entries in its document. */
async function isPublished(did: identity.DID): Promise<boolean> {
  const chainState = await stronghold.chainStateGet(did)
  return chainState && Object.keys(chainState.toJSON()).length === 0 ? false : true
}

/**
 * Print all DIDs contained in the local Stronghold storage.
 * DIDs printed in white are published while greys are not.
 */
async function printDIDs(): Promise<void> {
  const didList: identity.DID[] = await stronghold.didList()

  let publishCount = 0
  for (const did of didList) {
    let printColor = ANSI.reset + ANSI.bright
    ;(await isPublished(did)) ? publishCount++ : (printColor = ANSI.grayForeground)
    console.log(`${printColor}${did.toString()}`)
  }

  console.log(`${ANSI.reset}Stronghold contains ${didList.length} entries of which ${publishCount} are published.`)
}

printDIDs()
