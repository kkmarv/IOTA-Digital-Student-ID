export const HTTP_ERROR_MESSAGES = {
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
  tangleNoConnection: 'Keeper could not connect to the Tangle.'
}