import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { UniversityID } from '../digitalIDs/UniversityID.js'
import { LibraryAccess } from '../subjects/LibraryAccess.js'
import { StudyData } from '../subjects/Matriculation.js'
import { CredentialType } from '../types.js'
import nextSemesterStart from '../util/time.js'

/**
 * A Verifiable {@link Credential} to assess the matriculation of its holder.
 */
export class StudentVC extends identity.Credential {
  constructor(issuer: UniversityID, subject: StudyData) {
    super({
      // id: undefined, // FIXME necessary?
      type: CredentialType.UNIVERSITY_MATRICULATION,
      credentialSubject: subject,
      issuer: issuer.id,
      // credentialStatus: {
      //     id: issuer.id + '#', // TODO + revocationBitmapFragment,
      //     type: RevocationBitmap.type()
      // },
      issuanceDate: identity.Timestamp.nowUTC(),
      expirationDate: nextSemesterStart(),
      // credentialSchema: { // FIXME serde_json Error
      //   id: 'https://gitlab.hs-anhalt.de/stmosarw/projekt-anwendungsentwicklung/-/blob/backend/schemas/credentials/student.jsonld',
      //   types: 'StudentCredential'
      // },
      // termsOfUse: undefined, // TODO define tos
      // refreshService: undefined, // TODO define service
      // evidence: undefined, // TODO define evidence
      nonTransferable: true,
    })
  }
}

/**
 * A Verifiable {@link Credential} to assess the library access of its holder.
 */
export class LibraryCardVC extends identity.Credential {
  constructor(issuer: UniversityID, subject: LibraryAccess) {
    super({
      id: undefined,
      type: CredentialType.UNIVERSITY_LIBRARY_CARD,
      issuer: issuer.id,
      credentialStatus: {
        id: issuer.id + '#', // TODO + revocationBitmapFragment,
        type: identity.RevocationBitmap.type(),
      },
      credentialSubject: subject,
      issuanceDate: identity.Timestamp.nowUTC(),
      expirationDate: nextSemesterStart(),
      credentialSchema: undefined, // TODO define credentialSchema
      nonTransferable: true,
    })
  }
}
