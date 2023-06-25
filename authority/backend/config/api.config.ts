const apiBase = `/api`
export const apiPort = 8080
export const websocketPort = 3000

/** API routes */
export const routes = {
  challenge: apiBase + '/challenge',
  issueStudentIDCredential: apiBase + '/credential/student/issue',
  verifyStudentIDCredential: apiBase + '/credential/student/verify',
} as const

/** Reasons for a failed request */
export const failureReasons = {
  didMissing: 'Missing DID',
  didParsingFailed: 'Not an IOTA DID',

  presentationParsingFailed: 'Parsing of the Verifiable Presentation failed',
  presentationHolderMissing: 'No holder provided',
  presentationChallengeMissing: 'Please get a challenge first',
  presentationCredentialMissing: 'No Verifiable Credential provided',
  presentationValidationFailedUnknown: 'Unknown validation error',
  presentationCredentialTypeMismatch: (credentialType: string) => `No ${credentialType} found`,
} as const

/** Types of Verifiable Credentials */
export const credentialTypes = {
  studentID: 'StudentIDCredential',
  nationalID: 'NationalIDCredential',
} as const
