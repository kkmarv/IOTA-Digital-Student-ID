import { DID } from '@iota/identity-wasm/node/identity_wasm.js'
import { IStudent, IPostalAddress, IRegistrationData, UniversityDegree } from './types.js'
import { StudentVC } from './verifiable/credentials.js'


export function studentCredential(data: any): data is StudentVC {
  return true
}

export function registrationData(data: any): data is IRegistrationData {
  data = data as IRegistrationData
  try {
    return (
      did(data.id) &&
      typeof data.studySubject.name === 'string' &&
      universityDegree(data.studySubject.degree) &&
      student(data.student) &&
      typeof data.challenge === 'string' &&
      typeof data.challengeSignature === 'string'
    )
  } catch (e) {
    if (e instanceof TypeError) {
      console.log(e);
    }
    else throw e
  }
  return false
}

export function student(student: any): student is IStudent {
  student = student as IStudent
  return (
    typeof student.firstName === 'string' &&
    typeof student.middleNames === 'string' &&
    typeof student.familyName === 'string' &&
    typeof student.birthDate === 'string' &&
    !isNaN(Date.parse(student.birthDate)) &&
    postalAddress(student.address)
  )
}

export function universityDegree(degree: string): degree is UniversityDegree {
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


export * as isValid from './types.validation.js'