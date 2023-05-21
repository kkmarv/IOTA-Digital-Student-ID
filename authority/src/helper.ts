import crypto from 'crypto'

export function randomString(length: number): string {
  if (length <= 0) {
    return ''
  }

  // Converting to hex doubles the string in length
  // The following logic only deals with resizing the generated string to the given length
  length = length / 2 + 1
  let randomString = crypto.randomBytes(length).toString('hex')
  randomString = length % 2 == 0 ? randomString.slice(0, -2) : randomString.slice(0, -1)

  return randomString
}

export interface AuthenticationResponse {
  signedData: {
    proof: {
      challenge: string
      verificationMethod: string
    }
  }
}

export interface HelloResponse {
  did: string
}
