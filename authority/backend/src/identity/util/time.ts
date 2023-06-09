import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { startSummerSemester, startWinterSemester } from '../../config.js'

const today = new Date()
const currentYear = today.getFullYear()
const summerSemesterStartDate = new Date(`${currentYear}-${startSummerSemester}`)
const winterSemesterStartDate = new Date(`${currentYear}-${startWinterSemester}`)

/**
 * Calculate the date on which the next semester begins.
 * @returns The {@link identity.Timestamp} of next semester's first day.
 */
export default function nextSemesterStart(): identity.Timestamp {
  if (today < summerSemesterStartDate) {
    return identity.Timestamp.parse(summerSemesterStartDate.toISOString())
  } else if (today < winterSemesterStartDate) {
    return identity.Timestamp.parse(winterSemesterStartDate.toISOString())
  } else {
    return identity.Timestamp.parse(`${currentYear + 1}-${startSummerSemester}`)
  }
}
