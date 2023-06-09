import * as identity from '@iota/identity-wasm/web/identity_wasm'
import type { NationalIDCard } from '../../../../typings'

const wasmFilePath = '../../node_modules/@iota/identity-wasm/web/identity_wasm_bg.wasm'

await identity.init(wasmFilePath)
identity.start()

const builder = new identity.AccountBuilder({
  autosave: identity.AutoSave.every(),
  autopublish: false,
  clientConfig: { network: identity.Network.devnet() },
})

// Create an account for the government authority (Issuer for National IDs)
const govAuthority = await builder.createIdentity({
  privateKey: new Uint8Array([
    222, 36, 206, 249, 184, 179, 75, 58, 132, 3, 154, 54, 35, 40, 113, 132, 210, 73, 11, 70, 24, 113, 47, 43, 127, 73,
    141, 129, 31, 175, 6, 18,
  ]), // throwaway secret key
})

/** Create a National ID Credential for a given DID */
export async function createNationalIDCredential(did: string, data: NationalIDCard): Promise<identity.Credential> {
  const cardSubject: identity.Subject = { id: did, ...data }
  const signingKey = govAuthority.document().defaultSigningMethod().id().fragment()

  const expirationDate = new Date()
  expirationDate.setFullYear(expirationDate.getFullYear() + 10)

  const credential = new identity.Credential({
    type: 'NationalIDCredential',
    issuer: govAuthority.document().id(),
    credentialSubject: cardSubject,
    // 10 years + leap days
    expirationDate: identity.Timestamp.parse(expirationDate.toISOString()),
    nonTransferable: true,
  })

  const proofOptions = new identity.ProofOptions({
    purpose: identity.ProofPurpose.assertionMethod(),
  })

  return await govAuthority.createSignedCredential(signingKey, credential, proofOptions)
}
