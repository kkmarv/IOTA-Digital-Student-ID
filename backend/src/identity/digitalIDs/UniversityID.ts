import {
  Account, Credential, DID, IdentitySetup, Issuer, MethodContent,
  ProofOptions, ProofPurpose, Timestamp
} from '@iota/identity-wasm/node/identity_wasm.js'
import cfg from '../../config.js'
import { DigitalID } from './DigitalID.js'
import { IMatriculationData, ServiceType } from '../types.js'
import { StudentVC } from '../verifiable/credentials.js'
import { StudentVP } from '../verifiable/presentations.js'


/**
 * A manager for a university's {@link DID} {@link Document}
 * that manages private keys and access to the IOTA Tangle.
 */
export class UniversityID extends DigitalID implements Issuer {
  private static readonly homepageFragment = '#linked-domain-homepage'
  private static readonly matriculationFragment = '#sign-matriculation-vc'

  // Issuer objects are forced to have an ID of type string instead of DID (@v0.6.0 of @iota/identity-wasm)
  readonly id: string
  readonly [properties: string]: unknown;

  private constructor(account: Account) {
    super(account)
    this.id = account.document().id().toString()
  }

  /**
   * Issue a new Verifiable Credential, effectively matriculating a student at this university.
   * @param subject The student's registration data.
   * @param challenge Arbitrary text taken from the student to include in this credential. Used for improved security.
   * @returns A signed Verifiable Credential providing information about the student's matriculation status.
   */
  issueMatriculationVC(subject: IMatriculationData, challenge: string): Promise<Credential> {
    return this.account.createSignedCredential(
      UniversityID.matriculationFragment,
      new StudentVC(this, subject),
      new ProofOptions({
        created: Timestamp.nowUTC(),
        expires: Timestamp.nowUTC().checkedAdd(cfg.iota.proofDuration),
        challenge: challenge,
        purpose: ProofPurpose.authentication()
      })
    )
  }

  verifyStudentVP(vp: StudentVP) {
    // DigitalID.resolver.verifyPresentation()
  }

  /**
   * Construct a new `UniversityID`.
   * @param name The official name of the university represented by this `UniversityID`.
   * @param homepage A URL identifying the university on the web, i.e. its homepage.
   * @param identitySetup Use a pre-generated Ed25519 private key for the {@link DID}.
   * @returns A new `UniversityID`.
   */
  static async new(name: string, homepage: string, identitySetup?: IdentitySetup): Promise<UniversityID> {
    this.resolver = await DigitalID.resolverBuilder.build()
    const account = await DigitalID.builder.createIdentity(identitySetup)

    // Set the university's DID as the Document controller
    await account.setController({ controllers: account.did() })
    // Add a reference to the university's web presence.

    await account.createService({
      fragment: UniversityID.homepageFragment,
      type: ServiceType.LINKED_DOMAINS,
      endpoint: homepage
    })

    // Create signing method for matriculation issuance
    await account.createMethod({
      fragment: UniversityID.matriculationFragment,
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
    return new UniversityID(account)
  }

  /**
   * Load an existing `UniversityID` from {@link Storage}.
   * @param did A string representing the {@link DID} of the `UniversityID` to look for.
   * @returns An existing `UniversityID`.
   * @throws `IdentityNotFound` if `did` cannot be found locally.
   */
  static async load(did: DID, name: string, homepage: string): Promise<UniversityID> {
    return new UniversityID(await DigitalID.builder.loadIdentity(did))
  }
}