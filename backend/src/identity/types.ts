import { DID, Subject } from '@iota/identity-wasm/node/identity_wasm.js'


interface IBaseData extends Subject {
  readonly id: DID
  readonly degree: UniversityDegree
  readonly courseOfStudy: string
}

// Contains information about a student's registration.
export interface IRegistrationData extends IBaseData {
  readonly personalData: IPersonalData
  readonly challenge: string
}

// Contains information about a student's matriculation.
export interface IMatriculationData extends IBaseData {
  readonly university: string
  readonly matriculationNumber: number
  readonly semester: number
}

// TODO
// Contains information about a student's library access.
export interface UniversityLibraryCard extends Subject { }

// A Collection of Credential types for easier configuration of Credentials.
export const CredentialType = {
  DOMAIN_LINKAGE: 'DomainLinkageCredential',
  UNIVERSITY_LIBRARY_CARD: 'UniversityLibraryCardCredential',
  UNIVERSITY_MATRICULATION: 'UniversityMatriculationCredential'
} as const

// A Collection of Service types for easier configuration of DID Documents.
export const ServiceType = {
  LINKED_DOMAINS: 'LinkedDomains'
} as const

// A literal type for university degrees.
export type UniversityDegree = 'Bachelor' | 'Master'

// Interface that defines contents of personal data.
export interface IPersonalData {
  firstNames: string[]
  lastName: string
  dateOfBirth: Date
  postalAddress: IPostalAddress
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