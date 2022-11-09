import nextSemesterStart from '../util/time.js'
import { Credential, RevocationBitmap, Timestamp } from '@iota/identity-wasm/node/identity_wasm.js'
import { CredentialType, IMatriculationData, UniversityLibraryCard } from '../types.js'
import { UniversityID } from '../digitalIDs.js'


/**
 * A Verifiable {@link Credential} to assess the matriculation of its holder.
 */
export class MatriculationVC extends Credential {
  constructor(issuer: UniversityID, subject: IMatriculationData) {
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
      // credentialSchema: undefined, // TODO define credentialSchema
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
  constructor(issuer: UniversityID, subject: UniversityLibraryCard) {
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