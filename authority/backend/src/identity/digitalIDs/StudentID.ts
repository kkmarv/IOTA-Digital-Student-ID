import identity from '@iota/identity-wasm/node'
import { authorityConfig } from '../../../config'
import { StudentVC } from '../verifiable/credentials.js'
import { StudentVP } from '../verifiable/presentations.js'
import { DigitalID } from './DigitalID.js'

/**
 * A manager for a student's {@link DID} {@link Document} that manages private keys and access to the Tangle.
 */
export class StudentID extends DigitalID {
  private static readonly studentVPFragment = '#key-sign-student'

  private constructor(account: identity.Account) {
    super(account)
  }

  /**
   * Create a Verifiable {@link Presentation} to present the matriculation status of this {@link StudentID}.
   * @param challenge The challenge to include in this Verifiable Presentation
   *                  as a proof of authentication. Typically issued by an {@link Issuer}.
   * @returns         A newly created {@link StudentVP} signed by this student.
   */
  async newSignedStudentVP(studentVC: StudentVC, challenge: string): Promise<identity.Presentation> {
    return this.account.createSignedPresentation(
      StudentID.studentVPFragment,
      new StudentVP(this.account.did(), studentVC),
      new identity.ProofOptions({
        challenge: challenge,
        created: identity.Timestamp.nowUTC(),
        expires: identity.Timestamp.nowUTC().checkedAdd(authorityConfig.proofExpiryDuration),
      })
    )
  }

  /**
   * Construct a new {@link StudentID}.
   * @param identitySetup Use a pre-generated Ed25519 private key for the {@link DID}.
   * @returns             A new {@link StudentID}.
   */
  static async new(identitySetup?: identity.IdentitySetup): Promise<StudentID> {
    const account = await DigitalID.builder.createIdentity(identitySetup)

    // Set the student's DID as the Document controller
    await account.setController({ controllers: account.did() })

    // Create signing method for StudentVPs
    await account.createMethod({
      fragment: StudentID.studentVPFragment,
      content: identity.MethodContent.GenerateEd25519(),
    })

    // Sign all changes made to the DID Document.
    await account.updateDocumentUnchecked(
      await account.createSignedDocument(
        account.document().defaultSigningMethod().id().fragment()!,
        account.document(),
        identity.ProofOptions.default()
      )
    )
    return new StudentID(account)
  }

  /**
   * Load an existing {@link StudentID} from {@link Storage}.
   * @param did The {@link DID} of the {@link StudentID} to look for.
   * @returns   An existing {@link StudentID}. Will throw an Error, if `did` cannot be found.
   */
  static async load(did: identity.DID): Promise<StudentID> {
    return new StudentID(await DigitalID.builder.loadIdentity(did))
  }
}
