import { DID, Subject } from '@iota/identity-wasm/node/identity_wasm.js'
import {
  IStudentData,
  IStudySubject,
  IRegistrationData,
  IStudyData,
  isIRegistrationData
} from './interfaces.js'


export class RegistrationData implements Subject {
  readonly id: DID
  readonly studentData: IStudentData
  readonly studySubject: IStudySubject
  readonly challenge?: string
  readonly challengeSignature?: string
  readonly [properties: string]: unknown

  constructor(data: IRegistrationData) {
    this.id = data.id
    this.studentData = data.studentData
    this.studySubject = data.studySubject
    this.challenge = data.challenge
    this.challengeSignature = data.challengeSignature
  }

  static fromJSON(data: any): RegistrationData | null {
    return isIRegistrationData(data) ? new RegistrationData(data) : null
  }
}

export class StudyData extends RegistrationData {
  readonly providerName: string
  readonly matriculationNumber: number
  readonly currentTerm: number

  constructor(regData: IRegistrationData, studyData: IStudyData) {
    // Leaving out challenge information as it is not necessary for study data.
    super({ id: regData.id, studentData: regData.studentData, studySubject: regData.studySubject })
    this.providerName = studyData.providerName
    this.currentTerm = studyData.currentTerm
    this.matriculationNumber = studyData.matriculationNumber
  }
}
