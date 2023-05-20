// API endpoint configuration
const PORT = 8081
const API_ROOT = '/api'

// JWT configuration
const TOKEN_SECRET = 'youraccesstokensecret' // TODO read from env file
const TOKEN_EXPIRES_IN = '7d' // TODO make shorter

// API Routes
const ROUTES = {
  didGet: API_ROOT + '/did/get',
  didCreate: API_ROOT + '/did/create',
  authTokenCreate: API_ROOT + '/auth/token/create',
  authTokenVerify: API_ROOT + '/auth/token/verify',
  credentialGet: API_ROOT + '/credentials/get/:name',
  credentialStore: API_ROOT + '/credentials/store',
  credentialList: API_ROOT + '/credentials/list',
  presentationCreate: API_ROOT + '/presentations/create',
}

const FAILURE_REASONS = {
  // Authentication
  jwtMissing: 'Missing authorization header.',
  jwtInvalid: 'Invalid JWT.',

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
  diskWriteFailure: 'Unknown error while saving credential to a file.',

  // Tangle
  tangleNoConnection: 'Keeper could not connect to the Tangle.',
}
