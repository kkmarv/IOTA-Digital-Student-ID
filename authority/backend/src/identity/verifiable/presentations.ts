import identity from '@iota/identity-wasm/node'
import { StudentVC } from './credentials.js'

/**
 * A Verifiable {@link Presentation} to present the matriculation status of a {@link StudentID}.
 */
export class StudentVP extends identity.Presentation {
  constructor(student: identity.DID, matriculationVC: StudentVC) {
    super({
      holder: student,
      verifiableCredential: matriculationVC,
    })
  }
}
