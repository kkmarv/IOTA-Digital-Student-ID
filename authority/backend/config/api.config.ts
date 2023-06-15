const apiBase = `/api`
export const apiPort = 8080
export const websocketPort = 3000

/** API routes */
export const routes = {
  challenge: apiBase + '/challenge',
  studentIDCredentialRequirements: apiBase + '/credential/student/requirements',
  issueStudentIDCredential: apiBase + '/credential/student/issue',
} as const

/** Reasons for a failed request */
export const failureReasons = {
  didMissing: 'Missing DID',
  didParsingFailed: 'Not an IOTA DID',

  presentationParsingFailed: 'Not a Verifiable Presentation',
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
