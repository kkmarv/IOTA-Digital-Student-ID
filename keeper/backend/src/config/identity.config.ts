import identity from '@iota/identity-wasm/node/identity_wasm.js'

identity.start()

/** IOTA AccountBuilder configuration used to create user accounts. */
export const accountBuilderConfig: identity.AccountBuilderOptions = {
  autopublish: false,
  autosave: identity.AutoSave.every(),
  clientConfig: { network: identity.Network.devnet() },
} as const

/** Keeper configuration used to manage user accounts. */
export const keeperConfig = {
  /** Fragment of the key exchange method that keeper uses. */
  exchangeKeyFragment: 'exchange-0',
  /** Fragment of the signing method that keeper uses. */
  arbitrarySigningKeyFragment: 'sign-0',

  /** Public information that is used as a part of key agreements. */
  publicCredentialAgreementInfo: 'Used by keeper for encryption and decryption of Verifiable Credentials.',
  /** Public information that is stored with encrypted credentials. */
  publicAdditionalCredentialData: 'Issued by keeper. Contains an encrypted Verifiable Credential.',

  /** Duration in minutes. Verifiable Presentations issued by keeper will expire after this duration. */
  proofExpiryDuration: 10,
} as const
