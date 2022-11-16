import {
  Account, DID, IdentitySetup, Presentation, ProofOptions, ProofPurpose,
  Timestamp
} from "@iota/identity-wasm/node"
import cfg from "../../config"
import { DigitalID } from "./DigitalID"
import { StudentVC } from "../verifiable/credentials"
import { StudentVP } from "../verifiable/presentations"


/**
 * A manager for a student's {@link DID} {@link Document} that manages private keys and access to the Tangle.
 */
export class StudentID extends DigitalID {
  private static readonly matriculationFragment = '#sign-vp-matriculation'

  private constructor(account: Account) {
    super(account)
  }

  /**
   * Create a Verifiable {@link Presentation} to present the matriculation status of this `StudentID`.
   * @param credential The credentials to include in this Verifiable Presentation.
   * @param challenge The challenge to include in this Verifiable Presentation as a proof of authentication.
   * Typically issued by an {@link Issuer}.
   * @returns A newly created {@link StudentVP} signed by this student.
   */
  async newSignedMatriculationVP(credential: StudentVC, challenge: string): Promise<Presentation> {
    return this.account.createSignedPresentation(
      StudentID.matriculationFragment,
      new StudentVP(this.account.did(), credential),
      new ProofOptions({
        created: Timestamp.nowUTC(),
        expires: Timestamp.nowUTC().checkedAdd(cfg.iota.proofDuration),
        challenge: challenge,
        purpose: ProofPurpose.authentication()
      })
    )
  }

  /**
   * Construct a new `StudentID`.
   * @param identitySetup Use a pre-generated Ed25519 private key for the {@link DID}.
   * @returns A new `StudentID`.
   */
  static async new(identitySetup?: IdentitySetup): Promise<StudentID> {
    const account = await DigitalID.builder.createIdentity(identitySetup)

    // Set the student's DID as the Document controller
    await account.setController({ controllers: account.did() })
    // Sign all changes made to the DID Document.
    await account.updateDocumentUnchecked(
      await account.createSignedDocument(
        account.document().defaultSigningMethod().id().fragment()!,
        account.document(),
        ProofOptions.default()
      )
    )
    return new StudentID(account)
  }

  /**
   * Load an existing `StudentID` from {@link Storage}.
   * @param did The {@link DID} of the `StudentID` to look for.
   * @returns An existing `StudentID`. Will throw an Error, if `did` cannot be found.
   */
  static async load(did: DID): Promise<StudentID> {
    return new StudentID(await DigitalID.builder.loadIdentity(did))
  }
}