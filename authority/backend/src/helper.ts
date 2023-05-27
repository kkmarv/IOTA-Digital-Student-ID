import crypto from 'crypto'

export function randomString(length: number): string {
  if (length <= 0) {
    return ''
  }

  length = length / 2 + 1
  let randomString = crypto.randomBytes(length).toString('hex')
  // Note: converting a string to hex doubles its length

  // This code is to ensure that the string is of the correct length
  randomString = length % 2 == 0 ? randomString.slice(0, -2) : randomString.slice(0, -1)

  return randomString
}
