import { Stronghold } from '@iota/identity-stronghold-nodejs'
import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { keeperConfig } from './config/identity.config.js'
import { retrieveAccount } from './helper.js'

/** The associated data that is used for encryption and decryption. */
const associatedData = Buffer.from(keeperConfig.publicAdditionalCredentialData)
/** The encryption algorithm that is used for encryption and decryption. */
const encryptionAlgorithm = identity.EncryptionAlgorithm.A256GCM()

/**
 * Encrypt a verifiable credential for a given DID.
 * @param did The DID of the user that the credential is encrypted for.
 * @param fragment The fragment of the key agreement method that is used for encryption.
 * @param credential The verifiable credential that is encrypted.
 * @param stronghold The Stronghold storage that is used to load the user's identity.
 * @returns The encrypted verifiable credential.
 */
export async function encryptCredential(did: identity.DID, credential: string, stronghold: Stronghold) {
  const agreementInfo = buildAgreementInfo(did)
  const cekAlgorithm = identity.CekAlgorithm.EcdhEs(agreementInfo)
  const encodedCredential = Buffer.from(credential, 'utf-8')
  const account = await retrieveAccount(did, stronghold)
  const document = account.document()

  let verificationMethod: identity.VerificationMethod | undefined
  try {
    verificationMethod = document.resolveMethod(keeperConfig.exchangeKeyFragment, identity.MethodScope.KeyAgreement())
  } catch (error) {
    console.error(
      `While trying to resolve a key agreement method with fragment ${keeperConfig.exchangeKeyFragment}`,
      `from ${did.toString()}`,
      agreementInfo.toJSON(),
      `the following exception ocurred:\n${error}`
    )
    return null
  }

  if (verificationMethod === undefined) {
    console.error(
      `No key agreement method`,
      `with fragment ${keeperConfig.exchangeKeyFragment}`,
      `found in DID document of ${did.toString()}.`
    )
    return null
  }

  const userPublicKey = verificationMethod.data().tryDecode()
  const encryptedCredential = await account.encryptData(
    encodedCredential,
    associatedData,
    encryptionAlgorithm,
    cekAlgorithm,
    userPublicKey
  )

  return encryptedCredential
}

/**
 * Decrypt a verifiable credential for a given DID.
 * @param encryptedCredential The encrypted verifiable credential.
 * @param did The DID of the user that the credential is decrypted for. Same as the DID that was used for encryption.
 * @param fragment The fragment of the key agreement method that is used for decryption.
 * @param stronghold The Stronghold storage that is used to load the user's identity.
 * @returns The decrypted verifiable credential.
 */
export async function decryptCredential(
  encryptedCredential: identity.EncryptedData,
  did: identity.DID,
  stronghold: Stronghold
) {
  const agreementInfo = buildAgreementInfo(did)
  const cekAlgorithm = identity.CekAlgorithm.EcdhEs(agreementInfo)
  const account = await retrieveAccount(did, stronghold)

  let decryptedCredential: Uint8Array
  try {
    decryptedCredential = await account.decryptData(
      encryptedCredential,
      encryptionAlgorithm,
      cekAlgorithm,
      keeperConfig.exchangeKeyFragment
    )
  } catch (error) {
    console.error(
      `While trying to decrypt a credential with method ${keeperConfig.exchangeKeyFragment}`,
      `from ${did.toString()}`,
      agreementInfo.toJSON(),
      `the following exception ocurred:\n${error}`
    )
    return null
  }

  const decodedCredential = JSON.parse(Buffer.from(decryptedCredential).toString('utf-8'))
  return decodedCredential
}

/** Create an agreement info object for a given DID specific to keeper.
 * @param did The DID that is used for encryption and decryption.
 * @returns The `AgreementInfo` object.
 */
function buildAgreementInfo(did: identity.DID) {
  return new identity.AgreementInfo(
    Buffer.from(did.toString()), // The sender's DID
    Buffer.from(did.toString()), // and receiver's DID are the same in keeper's case.
    Buffer.from(keeperConfig.publicCredentialAgreementInfo),
    new Uint8Array(0) // We don't need to provide private information for encryption in keeper's case.
  )
}
