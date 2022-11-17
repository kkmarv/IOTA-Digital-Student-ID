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
    data.id && isDID(data.id) &&
    data.studySubject && isIStudySubject(data.studySubject) &&
    data.student && isIStudentData(data.student) &&
    data.challenge && typeof data.challenge === 'string' &&
    data.challengeSignature && typeof data.challengeSignature === 'string'
  )
}

export function isIStudentData(data: any): data is IStudentData {
  return (
    data.firstName && typeof data.firstName === 'string' &&
    data.middleNames && typeof data.middleNames === 'string' &&
    data.familyName && typeof data.familyName === 'string' &&
    data.birthDate && (typeof data.birthDate === 'string' && !isNaN(Date.parse(data.birthDate)) ||
      data.birthDate instanceof Date) &&
    data.address && isIPostalAddress(data.address)
  )
}

export function isIStudySubject(data: any): data is IStudySubject {
  return (
    data.name && typeof data.name === 'string' &&
    data.degree && isUniversityDegree(data.degree)
  )
}