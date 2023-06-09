import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { exit } from 'process'
import { accountBuilderConfig } from '../src/config.js'

async function createVP(did: identity.DID, credential: identity.Credential, challenge: string) {
  const builder = new identity.AccountBuilder(accountBuilderConfig)
  const account = await builder.loadIdentity(did)

  const vp = new identity.Presentation({
    verifiableCredential: credential,
    holder: account.did(),
  })

  const proof = new identity.ProofOptions({
    challenge: challenge,
    expires: identity.Timestamp.nowUTC().checkedAdd(identity.Duration.minutes(10)),
  })

  const signedVP = await account.createSignedPresentation('sign-0', vp, proof)

  console.dir(signedVP.toJSON(), { depth: null })
}

const vc = JSON.parse(
  `{
    "@context": "https://www.w3.org/2018/credentials/v1",
    "type": [
      "VerifiableCredential",
      "StudentCredential"
    ],
    "credentialSubject": {
      "id": "did:iota:dev:93CAAWQeq6GmR8NCpJTEmNmUqvTUNJADoFNhDehF1XLU",
      "currentTerm": 1,
      "matriculationNumber": 1673140194620,
      "providerName": "Anhalt University of Applied Sciences",
      "studentData": {
        "address": {
          "city": "Musterstetten",
          "country": "Germany",
          "county": "Bavaria",
          "houseNumber": 123,
          "postalCode": 123456,
          "street": "Musterweg"
        },
        "birthDate": "09.07.2000",
        "familyName": "Henker",
        "firstName": "Dustin",
        "middleNames": "Friedrich Wilfried",
        "photo": "https://thispersondoesnotexist.com/"
      },
      "studySubject": {
        "degree": "Bachelor of Arts",
        "name": "Gender Studies"
      }
    },
    "issuer": "did:iota:dev:GTLHQCCGRUbT32FigCmKBos7x6VJk1WTAQnbYPUvMwmF",
    "issuanceDate": "2023-01-08T01:09:54Z",
    "expirationDate": "2023-04-01T00:00:00Z",
    "nonTransferable": true,
    "proof": {
      "type": "JcsEd25519Signature2020",
      "verificationMethod": "did:iota:dev:GTLHQCCGRUbT32FigCmKBos7x6VJk1WTAQnbYPUvMwmF#key-sign-student",
      "signatureValue": "515w4aVstpwFGLtJPL8xf82vfggDXQhb2eHqnqgcbsTJPkRh4j2gfgjYTCeWBRhTFLCQTb6wQa9VypVWncLKGcRQ"
    }
  }`
)

if (!process.argv[2]) {
  console.log('Please specify a challenge as first argument')
  exit()
}

createVP(
  identity.DID.parse('did:iota:dev:93CAAWQeq6GmR8NCpJTEmNmUqvTUNJADoFNhDehF1XLU'),
  identity.Credential.fromJSON(vc),
  process.argv[2]
)
