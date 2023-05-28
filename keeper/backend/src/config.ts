// API endpoint configuration
const API_VERSION = 0
export const API_PORT = 8081
export const API_BASE = `/api/v${API_VERSION}/`

// JWT configuration
export const TOKEN_SECRET = 'youraccesstokensecret' // TODO create random secret
export const TOKEN_EXPIRES_IN = '30m'

/** API endpoints */
export const ROUTES = {
  didGet: API_BASE + '/did/get',
  didSign: API_BASE + '/did/sign',
  didCreate: API_BASE + '/did/create',
  authTokenCreate: API_BASE + '/auth/token/create',
  authTokenVerify: API_BASE + '/auth/token/verify',
  authTokenDelete: API_BASE + '/auth/token/delete',
  credentialGet: API_BASE + '/credential/get/:credentialName',
  credentialStore: API_BASE + '/credential/store',
  credentialList: API_BASE + '/credential/list',
  presentationCreate: API_BASE + '/presentation/create',
}

/** Failure reasons for API responses */
export const FAILURE_REASONS = {
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
  verifiableCredentialDuplicate: 'Credential with same name already exists.',
  verifiableCredentialInvalid: 'Not a Verifiable Credential.',

  // Verifiable Credential names
  verifiableCredentialNameMissing: 'Missing credential name.',
  verifiableCredentialNameWrong: `Credential with this name does not exist.`,

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
