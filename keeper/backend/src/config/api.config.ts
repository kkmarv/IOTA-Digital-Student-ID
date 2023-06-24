import cors from 'cors'

// API endpoint configuration
export const apiPort = 8081
export const apiBase = `/api`
export const corsOptions: cors.CorsOptions = {
  origin: `http://localhost:5173`, // Vite dev server
  allowedHeaders: ['Content-Type'],
  credentials: true,
}

// JWT configuration
export const tokenSecret = 'youraccesstokensecret' // TODO create random secret
export const tokenExpiresIn = '2h'

/** API endpoints */
export const routes = {
  didGet: apiBase + '/did/get',
  didSign: apiBase + '/did/sign',
  didCreate: apiBase + '/did/create',
  authTokenCreate: apiBase + '/auth/token/create',
  authTokenVerify: apiBase + '/auth/token/verify',
  authTokenDelete: apiBase + '/auth/token/delete',
  credentialGet: apiBase + '/credential/get/:credentialName',
  credentialStore: apiBase + '/credential/store/:credentialName',
  credentialList: apiBase + '/credential/list',
  presentationCreate: apiBase + '/presentation/create',
}

/** Failure reasons for API responses */
export const failureReasons = {
  // Authentication
  jwtMissing: 'Missing JWT.',
  jwtInvalid: 'Invalid JWT.',
  jwtExpired: 'Login Expired.',

  // Credentials
  credentialsMissing: 'Missing username or password.',
  credentialsWrong: 'Wrong username or password.',

  // Passwords
  passwordMissing: 'Missing password.',
  passwordWrong: 'Wrong password.',

  // Challenges
  challengeMissing: 'Missing challenge.',

  // Verifiable Credentials
  verifiableCredentialMissing: 'Missing Verifiable Credential.',
  verifiableCredentialDuplicate: 'A Credential with the same name already exists.',
  verifiableCredentialInvalid: 'Not a Verifiable Credential.',
  verifiableCredentialDecryptionFailed: 'Could not decrypt the Verifiable Credential.',
  verifiableCredentialEncryptionFailed: 'Could not encrypt the Verifiable Credential.',

  // Verifiable Credential names
  verifiableCredentialNameMissing: 'Missing credential name.',
  verifiableCredentialNotFound: `A Credential with this name does not exist.`,

  // Users
  userDuplicate: 'Username already taken.',

  // DIDs
  didDuplicate: 'Corrupted Stronghold storage file.',

  // Disk operations
  diskReadFailure: 'Unknown error while reading the credential file(s).',
  diskWriteFailure: 'Unknown error while saving the credential to a file.',

  // Tangle
  tangleNoConnection: 'Keeper could not connect to the Tangle.',
}
