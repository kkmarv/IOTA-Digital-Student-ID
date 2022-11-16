import { DID, Subject } from '@iota/identity-wasm/node/identity_wasm.js'


interface IBaseData extends Subject {
  readonly id: DID
  readonly studySubject: {
    readonly name: string
    readonly degree: UniversityDegree
  }
  readonly student: IStudent
}

// Contains information about a student's registration.
export interface IRegistrationData extends IBaseData {
  readonly challenge: string
  readonly challengeSignature: string
}

// Contains information about a student's matriculation.
export interface IMatriculationData extends IBaseData {
  readonly providerName: string
  readonly matriculationNumber: number
  readonly currentTerm: number
}

// TODO
// Contains information about a student's library access.
export interface UniversityLibraryCard extends Subject { }

// A Collection of Credential types for easier configuration of Credentials.
export const CredentialType = {
  DOMAIN_LINKAGE: 'DomainLinkageCredential',
  UNIVERSITY_LIBRARY_CARD: 'LibraryCardCredential',
  UNIVERSITY_MATRICULATION: 'StudentCredential'
} as const

// A Collection of Service types for easier configuration of DID Documents.
export const ServiceType = {
  LINKED_DOMAINS: 'LinkedDomains'
} as const

// A literal type for university degrees.
export type UniversityDegree = 'Bachelor of Arts' |
  'Bachelor of Business Administration' |
  'Bachelor of Education' |
  'Bachelor of Engineering' |
  'Bachelor of Fine Arts' |
  'Bachelor of Laws' |
  'Bachelor of Music' |
  'Bachelor of Musical Arts' |
  'Bachelor of Science' |
  'Master of Arts' |
  'Master of Business Administration' |
  'Master of Education' |
  'Master of Engineering' |
  'Master of Fine Arts' |
  'Master of Laws' |
  'Master of Music' |
  'Master of Musical Arts' |
  'Master of Science'

export interface IStudent {
  readonly firstName: string
  readonly middleNames: string
  readonly familyName: string
  readonly birthDate: Date
  readonly photo: URL
  readonly address: IPostalAddress
}

// Interface that defines the contents of a postal address.
export interface IPostalAddress {
  // Example: Musterweg
  street: string
  // Example: 123
  houseNumber: number
  // Example: ABC, abc, ...
  suffix?: string
  // Example: 123, Floor 3, ...
  apartment?: string
  // Example: 123456
  postalCode: string | number
  // Example: Musterstetten
  city: string
  // Example: Bavaria
  county: string
  // Example: Germany
  country: string
}