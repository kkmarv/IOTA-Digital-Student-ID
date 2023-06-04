import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { START_SUMMER_SEMESTER, START_WINTER_SEMESTER } from '../../config.js'

const today = new Date()
const currentYear = today.getFullYear()
const startSS = new Date(`${currentYear}-${START_SUMMER_SEMESTER}`)
const startWS = new Date(`${currentYear}-${START_WINTER_SEMESTER}`)

/**
 * Calculate the date on which the next semester begins.
 * @returns The {@link Timestamp} of next semester's first day.
 */
export default function nextSemesterStart(): identity.Timestamp {
  if (today < startSS) {
    return identity.Timestamp.parse(startSS.toISOString())
  } else if (today < startWS) {
    return identity.Timestamp.parse(startWS.toISOString())
  } else {
    return identity.Timestamp.parse(`${currentYear + 1}-${START_SUMMER_SEMESTER}`)
  }
}
