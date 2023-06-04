import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { ACCOUNT_BUILDER_CONFIG, AUTHORITY_CONFIG } from './config.js'

// Load the DID Document from Stronghold
const accBuilder = new identity.AccountBuilder(ACCOUNT_BUILDER_CONFIG)
const authority = await accBuilder.loadIdentity(AUTHORITY_CONFIG.did)

// Set the university's DID as the Document controller
await authority.setController({ controllers: AUTHORITY_CONFIG.did })

// Add a reference to the university's web presence
await authority.createService({
  fragment: '#website',
  type: 'LinkedDomains',
  endpoint: AUTHORITY_CONFIG.website,
})

// Create signing method for matriculation issuance
await authority.createMethod({
  fragment: '#matriculation',
  content: identity.MethodContent.GenerateEd25519(),
})

// Sign all changes that were made to the DID Document
await authority.updateDocumentUnchecked(
  await authority.createSignedDocument(
    authority.document().defaultSigningMethod().id().fragment()!,
    authority.document(),
    new identity.ProofOptions({
      purpose: identity.ProofPurpose.assertionMethod(),
      created: identity.Timestamp.nowUTC(),
    })
  )
)

// await authority.publish()

console.dir(authority.document().toJSON(), { depth: null })

export default authority
