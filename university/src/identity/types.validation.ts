import { DID } from '@iota/identity-wasm/node/identity_wasm.js'
import { IPostalAddress, UniversityDegree } from './types.js'


export function isUniversityDegree(degree: string): degree is UniversityDegree {
  return (
    degree === 'Bachelor of Arts' ||
    degree === 'Bachelor of Business Administration' ||
    degree === 'Bachelor of Education' ||
    degree === 'Bachelor of Engineering' ||
    degree === 'Bachelor of Fine Arts' ||
    degree === 'Bachelor of Laws' ||
    degree === 'Bachelor of Music' ||
    degree === 'Bachelor of Musical Arts' ||
    degree === 'Bachelor of Science' ||
    degree === 'Master of Arts' ||
    degree === 'Master of Business Administration' ||
    degree === 'Master of Education' ||
    degree === 'Master of Engineering' ||
    degree === 'Master of Fine Arts' ||
    degree === 'Master of Laws' ||
    degree === 'Master of Music' ||
    degree === 'Master of Musical Arts' ||
    degree === 'Master of Science'
  )
}

export function isIPostalAddress(address: any): address is IPostalAddress {
  return (
    typeof address.street === 'string' &&
    typeof address.houseNumber === 'number' &&
    (typeof address.postalCode === 'string' || typeof address.postalCode === 'number') &&
    typeof address.city === 'string' &&
    typeof address.county === 'string' &&
    typeof address.country === 'string'
  )
}

// THIs has to be better
export function isDID(did: string): boolean {
  try {
    DID.parse(did);
  } catch (e: unknown) {
    return false
  }
  return true
}


export * as isValid from './types.validation.js'