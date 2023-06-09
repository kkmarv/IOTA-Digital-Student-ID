import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { accountBuilderConfig, authorityConfig } from './config.js'

// Load the DID document from Stronghold
const accBuilder = new identity.AccountBuilder(accountBuilderConfig)
const authority = await accBuilder.loadIdentity(authorityConfig.did)

await authority.setController({ controllers: authorityConfig.did })

await authority.createService({
  fragment: authorityConfig.serviceFragments.website,
  type: 'LinkedDomain',
  endpoint: authorityConfig.website,
})

await authority.createMethod({
  fragment: authorityConfig.methodFragments.signStudentIDCredential,
  content: identity.MethodContent.GenerateEd25519(),
  scope: identity.MethodScope.VerificationMethod(),
})

await authority.createMethod({
  fragment: authorityConfig.methodFragments.signChallenge,
  content: identity.MethodContent.GenerateEd25519(),
  scope: identity.MethodScope.VerificationMethod(),
})

// Sign all changes that were made to the DID Document
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

// await authority.publish()

console.dir(authority.document().toJSON(), { depth: null })

export default authority
