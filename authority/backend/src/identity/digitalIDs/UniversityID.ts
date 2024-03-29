import identity from '@iota/identity-wasm/node'
import { StudyData } from '../subjects/Matriculation.js'
import { ServiceType } from '../types.js'
import { StudentVC } from '../verifiable/credentials.js'
import { StudentVP } from '../verifiable/presentations.js'
import { DigitalID } from './DigitalID.js'

/**
 * A manager for a university's {@link DID} {@link Document}
 * that manages private keys and access to the IOTA Tangle.
 */
export class UniversityID extends DigitalID implements identity.Issuer {
  private static readonly homepageFragment = '#linked-domain-homepage'
  private static readonly matriculationFragment = '#key-sign-student'

  // Issuer objects are forced to have an ID of type string instead of DID (@v0.6.0 of @iota/identity-wasm)
  readonly id: string;
  readonly [properties: string]: unknown

  private constructor(account: identity.Account) {
    super(account)
    this.id = account.document().id().toString()
  }

  /**
   * Issue a signed Verifiable Credential, effectively matriculating a student
   * at this university.
   * @param subject   The student's matriculation data.
   * @returns         A signed Verifiable Credential providing information
   *                  about the student's matriculation status.
   */
  issueStudentVC(subject: StudyData): Promise<identity.Credential> {
    return this.account.createSignedCredential(
      UniversityID.matriculationFragment,
      new StudentVC(this, subject),
      identity.ProofOptions.default()
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
  static async new(name: string, homepage: string, identitySetup?: identity.IdentitySetup): Promise<UniversityID> {
    this.resolver = await DigitalID.resolverBuilder.build()
    const account = await DigitalID.builder.createIdentity(identitySetup)

    // Set the university's DID as the Document controller
    await account.setController({ controllers: account.did() })

    // Add a reference to the university's web presence.
    await account.createService({
      fragment: UniversityID.homepageFragment,
      type: ServiceType.LINKED_DOMAINS,
      endpoint: homepage,
    })

    // Create signing method for matriculation issuance.
    await account.createMethod({
      fragment: UniversityID.matriculationFragment,
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

    await account.publish()

    return new UniversityID(account)
  }

  /**
   * Load an existing `UniversityID` from {@link Storage}.
   * @param did The {@link DID} of the `UniversityID`.
   * @returns An existing `UniversityID`.
   * @throws `IdentityNotFound` if `did` cannot be found locally.
   */
  static async load(did: identity.DID): Promise<UniversityID> {
    return new UniversityID(await DigitalID.builder.loadIdentity(did))
  }
}
