import { DID } from '@iota/identity-wasm/node/identity_wasm.js';
import { IPostalAddress, UniversityDegree } from '../types.js';
import { isDID, isIPostalAddress, isUniversityDegree } from '../types.validation.js';


/* Interfaces */

// Data needed for registering a student
export interface IRegistrationData {
  readonly id: DID;
  readonly studySubject: IStudySubject;
  readonly studentData: IStudentData;
  readonly challenge?: string;
  readonly challengeSignature?: string;
}

// Personal data of a student
export interface IStudentData {
  readonly firstName: string;
  readonly middleNames: string;
  readonly familyName: string;
  readonly birthDate: Date;
  readonly photo: URL;
  readonly address: IPostalAddress;
}

// Properties defining a study subject
export interface IStudySubject {
  readonly name: string;
  readonly degree: UniversityDegree;
}

// Data describing a matriculation
export interface IMatriculationData {
  readonly providerName: string;
  readonly matriculationNumber: number;
  readonly currentTerm: number;
}


/* Type Guards */

export function isIRegistrationData(data: any): data is IRegistrationData {
  return (
    isDID(data.id) &&
    isIStudySubject(data.studySubject) &&
    isIStudentData(data.student) &&
    typeof data.challenge === 'string' &&
    typeof data.challengeSignature === 'string'
  )
}

export function isIStudentData(data: any): data is IStudentData {
  return (
    typeof data.firstName === 'string' &&
    typeof data.middleNames === 'string' &&
    typeof data.familyName === 'string' &&
    (typeof data.birthDate === 'string' || data.birthDate instanceof Date) &&
    !isNaN(Date.parse(data.birthDate)) &&
    isIPostalAddress(data.address)
  )
}

export function isIStudySubject(data: any): data is IStudySubject {
  return (
    typeof data.name === 'string' &&
    isUniversityDegree(data.degree)
  )
}