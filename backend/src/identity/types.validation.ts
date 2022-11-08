import { DID } from '@iota/identity-wasm/node'
import { IPersonalData, IPostalAddress, IRegistrationData, UniversityDegree } from './types'


export function registrationData(data: any): data is IRegistrationData {
  data = data as IRegistrationData
  return (
    did(data.id) &&
    universityDegree(data.degree) &&
    typeof data.courseOfStudy === 'string' &&
    personalData(data.personalData) &&
    typeof data.challenge === 'string'
  )
}

export function universityDegree(degree: string): degree is UniversityDegree {
  return degree === 'Bachelor' || degree === 'Master'
}

export function personalData(data: any): data is IPersonalData {
  data = data as IPersonalData
  return (
    Array.isArray(data.firstNames) &&
    data.firstNames.length > 0 &&
    data.firstNames.every((entry: any) => {
      return typeof entry === 'string'
    }) &&
    typeof data.lastName === 'string' &&
    typeof data.dateOfBirth === 'string' &&
    !isNaN(new Date(data.dateOfBirth).getTime()) &&
    postalAddress(data.postalAddress)
  )
}

export function postalAddress(address: any): address is IPostalAddress {
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
export function did(did: string): boolean {
  try {
    DID.parse(did);
  } catch (e: unknown) {
    return false
  }
  return true
}


export * as isValid from './types.validation'