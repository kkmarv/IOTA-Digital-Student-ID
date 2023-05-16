import fs from 'fs'
import crypto from 'crypto'
import { Stronghold } from '@iota/identity-stronghold-nodejs'


interface ExtendedProofDocument {
  "created": string,
  "creator": string,
  "nonce": string
  "type": string,
  "verificationMethod": string
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
  "type": string[],
  "holder"?: string,
  "verifiableCredential": VerifiableCredentialDataModel[]
}

type VerifiableCredentialDataModel = CredentialDataModel & ProofDataModel;
type VerifiablePresentationDataModel = PresentationDataModel & ProofDataModel;
export type UserCredentials = { username: string, password: string }
export type JsonWebToken = { jwt: string }

export function isJsonWebToken(payload: any): payload is JsonWebToken {
  const p = payload as JsonWebToken
  return (!!(
    Object.keys(p).length === 1 &&
    p.jwt &&
    typeof p.jwt === 'string' &&
    p.jwt.length > 0
  ))
}

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


/**
 * Create a Stronghold object.
 * 
 * @param username Name of the Stronghold file
 * @param password Password of the Stronghold file
 * @param strongholdShouldExist Wether you expect the Stronghold to already exist
 * @returns
 * - A Stronghold object on successful creation
 * - Null if `password` is wrong or if `strongholdShouldExist` 
 * is set to true and the Stronghold file does not exist
 */
export async function buildStronghold(username: string, password: string, strongholdShouldExist = true): Promise<Stronghold | null> {
  const strongholdPath = getStrongholdPath(username)

  if (strongholdShouldExist && !fs.existsSync(strongholdPath)) {
    return null
  }

  // Build Stronghold storage file in /identities/<username>.hodl
  // Building fails if file already exists but password is wrong
  let stronghold: Stronghold
  try {
    stronghold = await Stronghold.build(strongholdPath, password)
  } catch (err) {
    console.error(err)
    return null
  }

  return stronghold
}


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