import { Stronghold } from '@iota/identity-stronghold-nodejs'
import identity from '@iota/identity-wasm/node/identity_wasm.js'
import crypto from 'crypto'
import fs from 'fs'
import { accountBuilderConfig } from './config/identity.config.js'

interface ExtendedProofDocument {
  created: string
  creator: string
  nonce: string
  type: string
  verificationMethod: string
}

interface ProofDataModel {
  proof?: ExtendedProofDocument
}

interface CredentialDataModel {
  '@context': string[]
  type: string[]
  issuer: string
  issuanceDate: string
  credentialSubject: object
}

interface PresentationDataModel {
  '@context': string[]
  type: string[]
  holder?: string
  verifiableCredential: VerifiableCredentialDataModel[]
}

type VerifiableCredentialDataModel = CredentialDataModel & ProofDataModel
type VerifiablePresentationDataModel = PresentationDataModel & ProofDataModel
export type UserCredentials = { username: string; password: string }
export type JsonWebToken = { jwt: string }

export function isJsonWebToken(payload: any): payload is JsonWebToken {
  const p = payload as JsonWebToken
  return !!(Object.keys(p).length === 1 && p.jwt && typeof p.jwt === 'string' && p.jwt.length > 0)
}

export function isUserCredentials(payload: any): payload is UserCredentials {
  const p = payload as UserCredentials
  return !!(
    Object.keys(p).length === 2 &&
    p.username &&
    typeof p.username === 'string' &&
    p.username.length > 0 &&
    p.password &&
    typeof p.password === 'string'
  )
}

export function isVerifiablePresentation(
  payload: VerifiablePresentationDataModel | unknown
): payload is VerifiablePresentationDataModel {
  return !!(payload as VerifiablePresentationDataModel).verifiableCredential?.length
}

/**
 * @param payload
 * @returns true if all properties of a Verifiable Credential are present.
 */
export function isVerifiableCredential(payload: any): payload is VerifiableCredentialDataModel {
  const p = payload as VerifiableCredentialDataModel
  return !!(p['@context'] && p.credentialSubject && p.issuanceDate.length && p.issuer.length && p.proof! && p.type)
}

/**
 * Create a Stronghold object.
 * @param username Resolves to the directory name where the Stronghold file is stored.
 * @param password Password of the Stronghold file.
 * @param strongholdShouldExist Wether you expect the Stronghold to already exist. Defaults to true.
 * @returns
 * - A Stronghold object on successful creation.
 * - `Null` if:
 *   - The `password` is wrong
 *   - `strongholdShouldExist` is set to true and the user/Stronghold file does not exist
 */
export async function buildStronghold(username: string, password: string, strongholdShouldExist = true) {
  const strongholdPath = getStrongholdPath(username)
  if (strongholdShouldExist && !fs.existsSync(strongholdPath)) {
    return null
  }

  // Build Stronghold storage file from username and password. Building fails only if the password is wrong
  let stronghold: Stronghold
  try {
    stronghold = await Stronghold.build(strongholdPath, password)
  } catch (error) {
    console.error(error)
    return null
  }
  return stronghold
}

/**
 * Builds an account for a given DID by loading the identity from Stronghold.
 * @param did  The DID of the user that the account is retrieved for.
 * @param storage The Stronghold storage that is used to load the user's identity.
 * @returns The account.
 */
export async function retrieveAccount(did: identity.DID, storage: Stronghold) {
  const builder = new identity.AccountBuilder({
    autopublish: accountBuilderConfig.autopublish,
    autosave: accountBuilderConfig.autosave,
    clientConfig: accountBuilderConfig.clientConfig,
    storage: storage,
  })

  let account: identity.Account
  try {
    account = await builder.loadIdentity(did)
  } catch (error) {
    // TODO error handling
    throw new Error('Could not load identity.')
  }

  return account
}

export function getStrongholdPath(username: string) {
  return `${userDirectory(username)}/identity.hodl`
}

/**
 * Hashes the username for two main reasons:
 * 1) Will create a valid filename from any username.
 * 2) Keeps the username anonymous.
 * @param username
 * @returns The directory where user files are stored.
 */
export function userDirectory(username: string) {
  return `./vault/${sha512(username)}`
}

function sha512(clearText: string) {
  return crypto.createHash('sha512').update(clearText).digest('hex')
}
