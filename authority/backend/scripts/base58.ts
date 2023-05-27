const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const ALPHABET_MAP = new Map<string, number>()

let i = 0

while (i < ALPHABET.length) {
  ALPHABET_MAP.set(ALPHABET.charAt(i), i)
  i++
}

export function encode58(buffer: Uint8Array): string {
  let carry, digits, j
  if (buffer.length === 0) {
    return ''
  }
  digits = [0]
  i = 0
  while (i < buffer.length) {
    j = 0
    while (j < digits.length) {
      digits[j] <<= 8
      j++
    }
    digits[0] += buffer[i]
    carry = 0
    j = 0
    while (j < digits.length) {
      digits[j] += carry
      carry = (digits[j] / 58) | 0
      digits[j] %= 58
      ++j
    }
    while (carry) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
    i++
  }
  i = 0
  while (buffer[i] === 0 && i < buffer.length - 1) {
    digits.push(0)
    i++
  }
  return digits
    .reverse()
    .map(function (digit) {
      return ALPHABET[digit]
    })
    .join('')
}

export function decode58(text: string) {
  let bytes, c, carry, j
  if (text.length === 0) {
    return new (typeof Uint8Array !== 'undefined' && Uint8Array !== null ? Uint8Array : Buffer)(0)
  }
  bytes = [0]
  i = 0
  while (i < text.length) {
    c = text[i]
    if (!(c in ALPHABET_MAP)) {
      throw 'Base58.decode received unacceptable input. Character ' + c + ' is not in the Base58 alphabet.'
    }
    j = 0
    while (j < bytes.length) {
      bytes[j] *= 58
      j++
    }
    bytes[0] += ALPHABET_MAP.get(c)!
    carry = 0
    j = 0
    while (j < bytes.length) {
      bytes[j] += carry
      carry = bytes[j] >> 8
      bytes[j] &= 0xff
      ++j
    }
    while (carry) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
    i++
  }
  i = 0
  while (text[i] === '1' && i < text.length - 1) {
    bytes.push(0)
    i++
  }
  return new (typeof Uint8Array !== 'undefined' && Uint8Array !== null ? Uint8Array : Buffer)(bytes.reverse())
}
