import { Timestamp } from '@iota/identity-wasm/node/identity_wasm'
import config from '../../config'


const today = new Date()
const currentYear = today.getFullYear()
const startSS = new Date(`${currentYear}-${config.ssStart}T00:00:00Z`)
const startWS = new Date(`${currentYear}-${config.wsStart}T00:00:00Z`)

/**
 * Calculate the date on which the next semester begins.
 * @returns The {@link Timestamp} of next semester's first day.
 */
export default function nextSemesterStart(): Timestamp {
  if (today < startSS) {
    return Timestamp.parse(startSS.toISOString())
  } else if (today < startWS) {
    return Timestamp.parse(startWS.toISOString())
  } else {
    return Timestamp.parse(`${currentYear + 1}-04-01T00:00:00Z`)
  }
}