import {DID, Presentation} from '@iota/identity-wasm/node/identity_wasm.js'
import {MatriculationVC} from './credentials.js'


/**
 * A Verifiable {@link Presentation} to present the matriculation status of a {@link StudentID}.
 */
export class MatriculationVP extends Presentation {
    constructor(student: DID, matriculationVC: MatriculationVC | Array<MatriculationVC>) {
        super({
            // context: Presentation.BaseContext(),
            // id: undefined,
            // type: Presentation.BaseType(),
            verifiableCredential: matriculationVC
            // holder: student
            // refreshService: {id: '', types: ''},
            // termsOfUse: {id: '', types: ''}
        })
    }
}