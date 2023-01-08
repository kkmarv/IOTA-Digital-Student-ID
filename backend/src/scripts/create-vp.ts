import { AccountBuilder, Credential, DID, Duration, Presentation, ProofOptions, Timestamp } from "@iota/identity-wasm/node/identity_wasm.js";
import { exit } from "process";
import cfg from "../config.js";

async function createVP(credential: Credential, challenge: string) {
  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig)
  const account = await builder.loadIdentity(DID.parse("did:iota:dev:ggUs8jhh4fPqcS9im3VpCF3rvjp349dksGozWKQ5JZn"))

  const vp = new Presentation({
    verifiableCredential: credential,
    holder: account.did()
  })

  const proof = new ProofOptions({
    challenge: challenge,
    expires: Timestamp.nowUTC().checkedAdd(Duration.minutes(10))
  })

  const signedVP = await account.createSignedPresentation("sign-0", vp, proof)

  console.dir(signedVP.toJSON(), { depth: null });
}

const vc = JSON.parse(
  `{
    "@context": "https://www.w3.org/2018/credentials/v1",
    "type": [
      "VerifiableCredential",
      "StudentCredential"
    ],
    "credentialSubject": {
      "id": "did:iota:dev:ggUs8jhh4fPqcS9im3VpCF3rvjp349dksGozWKQ5JZn",
      "currentTerm": 1,
      "matriculationNumber": 1673133679294,
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
        "familyName": "Henke",
        "firstName": "Dustin",
        "middleNames": "Walter Bruno",
        "photo": "https://thispersondoesnotexist.com/"
      },
      "studySubject": {
        "degree": "Bachelor of Arts",
        "name": "Gender Studies"
      }
    },
    "issuer": "did:iota:dev:GTLHQCCGRUbT32FigCmKBos7x6VJk1WTAQnbYPUvMwmF",
    "issuanceDate": "2023-01-07T23:21:19Z",
    "expirationDate": "2023-01-10T00:00:00Z",
    "nonTransferable": true,
    "proof": {
      "type": "JcsEd25519Signature2020",
      "verificationMethod": "did:iota:dev:GTLHQCCGRUbT32FigCmKBos7x6VJk1WTAQnbYPUvMwmF#key-sign-student",
      "signatureValue": "22gg3pEm7Ge18cZeHzrLvKDqxu8kgLHqq5rTcLdc7tAgRvM6442uFTy7kK4EzFLLRS1RX4VaYPhcWdLibCTKXtTo"
    }
  }`
)

if (!process.argv[2]) {
  console.log("Please specify a DID as first argument");
  exit()
}

createVP(Credential.fromJSON(vc), process.argv[2])