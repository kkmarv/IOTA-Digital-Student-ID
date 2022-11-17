import nextSemesterStart from '../util/time.js'
import {
  Credential,
  RevocationBitmap,
  Timestamp
} from '@iota/identity-wasm/node/identity_wasm.js'
import { CredentialType } from '../types.js'
import { UniversityID } from '../digitalIDs/UniversityID.js'
import { RegistrationData } from '../subjects/Matriculation.js'
import { LibraryAccess } from '../subjects/LibraryAccess.js'


/**
 * A Verifiable {@link Credential} to assess the matriculation of its holder.
 */
export class StudentVC extends Credential {
  constructor(issuer: UniversityID, subject: RegistrationData) {
    super({
      id: undefined, // FIXME necessary?
      type: CredentialType.UNIVERSITY_MATRICULATION,
      credentialSubject: subject,
      issuer: issuer.id,
      // credentialStatus: {
      //     id: issuer.id + '#', // TODO + revocationBitmapFragment,
      //     type: RevocationBitmap.type()
      // },
      issuanceDate: Timestamp.nowUTC(),
      expirationDate: nextSemesterStart(),
      // credentialSchema: { // FIXME serde_json Error
      //   id: 'https://gitlab.hs-anhalt.de/stmosarw/projekt-anwendungsentwicklung/-/blob/backend/schemas/credentials/student.jsonld',
      //   types: 'StudentCredential'
      // },
      // termsOfUse: undefined, // TODO define tos
      // refreshService: undefined, // TODO define service
      // evidence: undefined, // TODO define evidence
      nonTransferable: true
    })
  }
}


/**
 * A Verifiable {@link Credential} to assess the library access of its holder.
 */
export class LibraryCardVC extends Credential {
  constructor(issuer: UniversityID, subject: LibraryAccess) {
    super({
      id: undefined,
      type: CredentialType.UNIVERSITY_LIBRARY_CARD,
      issuer: issuer.id,
      credentialStatus: {
        id: issuer.id + '#', // TODO + revocationBitmapFragment,
        type: RevocationBitmap.type()
      },
      credentialSubject: subject,
      issuanceDate: Timestamp.nowUTC(),
      expirationDate: nextSemesterStart(),
      credentialSchema: undefined, // TODO define credentialSchema
      nonTransferable: true
    })
  }
}