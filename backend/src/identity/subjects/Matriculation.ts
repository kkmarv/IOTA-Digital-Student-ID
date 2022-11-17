import { DID, Subject } from '@iota/identity-wasm/node/identity_wasm.js'
import { IStudentData, IStudySubject, IRegistrationData, IMatriculationData } from './interfaces'


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
    return new RegistrationData({
      id: data.id,
      studentData: data.student,
      studySubject: data.studySubject
    })
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
