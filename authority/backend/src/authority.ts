import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { accountBuilderConfig, authorityConfig } from './config.js'

let didUpdate = false

// Load the DID document from Stronghold
console.log('Loading DID document from Stronghold...')
const accBuilder = new identity.AccountBuilder(accountBuilderConfig)
const authority = await accBuilder.loadIdentity(authorityConfig.did)

const services = authority.document().service()
const methods = authority.document().methods()
const controllers = authority.document().controller()

// Check if the DID document contains a controller
const controller = controllers.find((controller) => controller.toString() === authorityConfig.did.toString())
if (!controller) {
  await authority.setController({ controllers: authorityConfig.did })
  console.log('Set controller of DID document')
  didUpdate = true
}

// Check if the DID document contains a service for the website
const websiteService = services.find((service) => service.id().fragment() === authorityConfig.serviceFragments.website)

if (!websiteService) {
  await authority.createService({
    fragment: authorityConfig.serviceFragments.website,
    type: 'LinkedDomain',
    endpoint: authorityConfig.website,
  })
  console.log('Created service for website')
  didUpdate = true
}

// Check if the DID document contains a verification method for signing student ID credentials
const signStudentIDCredentialMethod = methods.find(
  (method) => method.id().fragment() === authorityConfig.methodFragments.signStudentIDCredential
)

if (!signStudentIDCredentialMethod) {
  await authority.createMethod({
    fragment: authorityConfig.methodFragments.signStudentIDCredential,
    content: identity.MethodContent.GenerateEd25519(),
    scope: identity.MethodScope.VerificationMethod(),
  })
  console.log('Created method for signing student ID credentials')
  didUpdate = true
}

// Check if the DID document contains a verification method for signing challenges
const signChallengeMethod = methods.find(
  (method) => method.id().fragment() === authorityConfig.methodFragments.signChallenge
)

if (!signChallengeMethod) {
  await authority.createMethod({
    fragment: authorityConfig.methodFragments.signChallenge,
    content: identity.MethodContent.GenerateEd25519(),
    scope: identity.MethodScope.VerificationMethod(),
  })
  console.log('Created method for signing challenges')
  didUpdate = true
}

// Sign all changes that were made to the DID document
if (didUpdate) {
  await authority.updateDocumentUnchecked(
    await authority.createSignedDocument(
      authority.document().defaultSigningMethod().id().fragment()!,
      authority.document(),
      new identity.ProofOptions({
        purpose: identity.ProofPurpose.authentication(),
        created: identity.Timestamp.nowUTC(),
      })
    )
  )
  await authority.publish()
  console.log('Signed DID document changes and published DID document')
}

console.dir(authority.document().toJSON(), { depth: null })

export default authority
