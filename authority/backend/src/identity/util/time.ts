import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { startSummerSemester, startWinterSemester } from '../../config.js'

const today = new Date()
const currentYear = today.getFullYear()
const startSS = new Date(`${currentYear}-${startSummerSemester}`)
const startWS = new Date(`${currentYear}-${startWinterSemester}`)

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
    return identity.Timestamp.parse(`${currentYear + 1}-${startSummerSemester}`)
  }
}