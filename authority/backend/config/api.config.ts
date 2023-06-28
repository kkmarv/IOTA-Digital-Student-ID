const apiBase = `/api`
export const apiPort = 8080
export const websocketPort = 3000

// JWT configuration
export const tokenSecret = 'youraccesstokensecret' // TODO create random secret
export const tokenExpiresIn = '2h'

/** API routes */
export const routes = {
  challenge: apiBase + '/challenge',
  issueStudentIDCredential: apiBase + '/credential/student/issue',
  verifyStudentIDCredential: apiBase + '/credential/student/verify',

  authTokenCreate: apiBase + '/auth/token/create',
  authTokenVerify: apiBase + '/auth/token/verify',
} as const

/** Reasons for a failed request */
export const failureReasons = {
  // Authentication
  jwtMissing: 'Missing JWT.',
  jwtInvalid: 'Invalid JWT.',
  jwtExpired: 'Login Expired.',

  // Body Parsing: DIDs
  didMissing: 'Missing DID',
  didParsingFailed: 'Not an IOTA DID',

  // Body Parsing: Verifiable Presentations
  presentationParsingFailed: 'Parsing of the Verifiable Presentation failed',
  presentationHolderMissing: 'Verifiable Presentation does not have a holder',
  presentationChallengeMissing: 'Please get a challenge first',
  presentationCredentialMissing: 'Verifiable Presentation does not provide any Verifiable Credentials',
  presentationValidationFailedUnknown: 'Unknown validation error',
  presentationCredentialTypeMismatch: (credentialType: string) =>
    `Verifiable Presentation is expected to have a ${credentialType}`,
} as const

/** Types of Verifiable Credentials */
export const credentialTypes = {
  studentID: 'StudentIDCredential',
  nationalID: 'NationalIDCredential',
} as const
