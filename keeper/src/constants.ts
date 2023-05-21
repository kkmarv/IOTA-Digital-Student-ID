// API endpoint configuration
export const PORT = 8081
export const API_ROOT = '/api'

// JWT configuration
export const TOKEN_SECRET = 'youraccesstokensecret' // TODO read from env file
export const TOKEN_EXPIRES_IN = '30m'

// API Routes
export const ROUTES = {
  didGet: API_ROOT + '/did/get',
  didSign: API_ROOT + '/did/sign',
  didCreate: API_ROOT + '/did/create',
  authTokenCreate: API_ROOT + '/auth/token/create',
  authTokenVerify: API_ROOT + '/auth/token/verify',
  authTokenDelete: API_ROOT + '/auth/token/delete',
  credentialGet: API_ROOT + '/credentials/get/:credentialName',
  credentialStore: API_ROOT + '/credentials/store',
  credentialList: API_ROOT + '/credentials/list',
  presentationCreate: API_ROOT + '/presentations/create',
}

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
