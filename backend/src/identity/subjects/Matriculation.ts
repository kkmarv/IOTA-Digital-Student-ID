import { DID, Subject } from '@iota/identity-wasm/node/identity_wasm.js'
import {
  IStudentData,
  IStudySubject,
  IRegistrationData,
  IMatriculationData,
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
    return isIRegistrationData(data) ? new RegistrationData({
      id: data.id,
      studentData: data.studentData,
      studySubject: data.studySubject
    }) : null
  }
}

export class MatriculationData extends RegistrationData {
  readonly providerName: string
  readonly matriculationNumber: number
  readonly currentTerm: number

  constructor(regData: IRegistrationData, studyData: IMatriculationData) {
    super(regData)
    this.providerName = studyData.providerName
    this.currentTerm = studyData.currentTerm
    this.matriculationNumber = studyData.matriculationNumber
  }
}
