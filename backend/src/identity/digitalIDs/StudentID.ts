import cfg from '../../config.js'
import {
  Account,
  DID,
  IdentitySetup,
  MethodContent,
  Presentation,
  ProofOptions,
  ProofPurpose,
  Timestamp
} from '@iota/identity-wasm/node/identity_wasm.js'
import { DigitalID } from './DigitalID.js'
import { StudentVC } from '../verifiable/credentials.js'
import { StudentVP } from '../verifiable/presentations.js'


/**
 * A manager for a student's {@link DID} {@link Document} that manages private keys and access to the Tangle.
 */
export class StudentID extends DigitalID {
  private static readonly studentVPFragment = '#key-sign-student'
  private readonly studentVC: StudentVC

  private constructor(account: Account, studentVC: StudentVC) {
    super(account)
    this.studentVC = studentVC
  }

  /**
   * Create a Verifiable {@link Presentation} to present the matriculation status of this `StudentID`.
   * @param challenge The challenge to include in this Verifiable Presentation
   *                  as a proof of authentication. Typically issued by an {@link Issuer}.
   * @returns         A newly created {@link StudentVP} signed by this student.
   */
  async newSignedStudentVP(challenge: string): Promise<Presentation> {
    return this.account.createSignedPresentation(
      StudentID.studentVPFragment,
      new StudentVP(this.account.did(), this.studentVC),
      new ProofOptions({
        challenge: challenge,
        created: Timestamp.nowUTC(),
        expires: Timestamp.nowUTC().checkedAdd(cfg.iota.proofDuration)
      })
    )
  }

  /**
   * Construct a new `StudentID`.
   * @param identitySetup Use a pre-generated Ed25519 private key for the {@link DID}.
   * @returns             A new `StudentID`.
   */
  static async new(studentVC: StudentVC, identitySetup?: IdentitySetup): Promise<StudentID> {
    const account = await DigitalID.builder.createIdentity(identitySetup)

    // Set the student's DID as the Document controller
    await account.setController({ controllers: account.did() })

    // Create signing method for StudentVPs
    await account.createMethod({
      fragment: StudentID.studentVPFragment,
      content: MethodContent.GenerateEd25519()
    })

    // Sign all changes made to the DID Document.
    await account.updateDocumentUnchecked(
      await account.createSignedDocument(
        account.document().defaultSigningMethod().id().fragment()!,
        account.document(),
        ProofOptions.default()
      )
    )
    return new StudentID(account, studentVC)
  }

  /**
   * Load an existing `StudentID` from {@link Storage}.
   * @param did The {@link DID} of the `StudentID` to look for.
   * @returns   An existing `StudentID`. Will throw an Error, if `did` cannot be found.
   */
  static async load(did: DID, studentVC: StudentVC): Promise<StudentID> {
    return new StudentID(await DigitalID.builder.loadIdentity(did), studentVC)
  }
}