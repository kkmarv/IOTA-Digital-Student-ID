import crypto from 'crypto'


interface ExtendedProofDocument {
  created: string,
  creator: string,
  nonce: string
  type: string,
  verificationMethod: string
}

interface ProofDataModel {
  "proof"?: ExtendedProofDocument
}

interface CredentialDataModel {
  "@context": string[],
  "type": string[],
  "issuer": string,
  "issuanceDate": string,
  "credentialSubject": object
}

interface PresentationDataModel {
  "@context": string[],
  type: string[],
  holder?: string,
  verifiableCredential: VerifiableCredentialDataModel[]
}

type VerifiableCredentialDataModel = CredentialDataModel & ProofDataModel;
type VerifiablePresentationDataModel = PresentationDataModel & ProofDataModel;
export type UserCredentials = { username: string, password: string }

export function isUserCredentials(payload: any): payload is UserCredentials {
  const p = payload as UserCredentials
  return (!!(
    Object.keys(p).length === 2 &&
    p.username &&
    typeof p.username === 'string' &&
    p.username.length > 0 &&
    p.password &&
    typeof p.password === 'string' &&
    true
  ))
}

export function isVerifiablePresentation(payload: VerifiablePresentationDataModel | unknown): payload is VerifiablePresentationDataModel {
  return !!(payload as VerifiablePresentationDataModel).verifiableCredential?.length;
};

/**
 * @param payload 
 * @returns true if all properties of a Verifiable Credential are present.
 */
export function isVerifiableCredential(payload: any): payload is VerifiableCredentialDataModel {
  const p = payload as VerifiableCredentialDataModel
  return (!!(
    p['@context'] &&
    p.credentialSubject &&
    p.issuanceDate.length &&
    p.issuer.length &&
    p.proof! &&
    p.type
  ))
};


export function getStrongholdPath(username: string): string {
  return `${getUserDirectory(username)}/identity.hodl`
}

/**
 * Hash the username for mainly two reasons:
 * 1) Will create a valid filename from any username.
 * 2) Will keep username anonymous.
 * @param username 
 * @returns The directory where user files are stored.
 */
export function getUserDirectory(username: string): string {
  return `./vault/${sha512(username)}`
}

function sha512(clearText: string): string {
  return crypto.createHash('sha512').update(clearText).digest('hex')
}