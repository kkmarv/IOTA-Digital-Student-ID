import cfg from '../../../config.js'
import crypto from 'crypto'
import { FailFast, PresentationValidationOptions, PresentationValidator, SubjectHolderRelationship, VerifierOptions } from '@iota/identity-wasm/node/identity_wasm.js'
import { NextFunction, Request, Response } from 'express'
import { digital } from '../../../identity/index.js'
import { StudyData, RegistrationData } from '../../../identity/subjects/Matriculation.js'
import { HTTPCode, HTTPError } from '../../errors.js'
import { StudentID } from '../../../identity/digitalIDs/StudentID.js'


let student: StudentID

// Load the DID of the institution
// if a DID URL was found in env variables, else create a new identity
const institution = cfg.institution
const university = institution.did ?
  await digital.UniversityID.load(institution.did) :
  await digital.UniversityID.new(institution.name, institution.website)
console.dir(university.toJSON(), { depth: null });


export function sendChallenge(req: Request, res: Response) {
  res.setHeader('content-type', 'text/plain')
  return res.status(HTTPCode.OK).send(crypto.randomBytes(32).toString('hex'))
}


export async function register(req: Request, res: Response, next: NextFunction) {
  const registrationData = RegistrationData.fromJSON(req.body)

  if (registrationData === null) {
    return next(new HTTPError(HTTPCode.UNPROCESSABLE_CONTENT, 'Bad registration data.'))
  }

  // UniversityID.resolve()

  const studyData = new StudyData(
    registrationData,
    {
      currentTerm: 1,
      matriculationNumber: Date.now(),
      providerName: cfg.institution.name
    }
  )

  const signedStudentVC = await university.issueStudentVC(studyData)
  // TEST
  student = await StudentID.new(signedStudentVC)
  console.dir(student.toJSON(), { depth: null })
  // TEST
  return res.status(HTTPCode.OK).send(signedStudentVC.toJSON())
}


export async function login(req: Request, res: Response, next: NextFunction) {
  // const studentVP = StudentVP.fromJSON(req.body)
  const studentVP = await student.newSignedStudentVP('todo')
  console.log(studentVP.toJSON());
  console.log(student.account.document().id().toString());

  // Declare that the challenge must match our expectation:
  const presentationVerifierOptions = new VerifierOptions({
    challenge: 'todo',
    allowExpired: false,
  })

  const presentationValidationOptions = new PresentationValidationOptions({
    presentationVerifierOptions: presentationVerifierOptions,
    subjectHolderRelationship: SubjectHolderRelationship.AlwaysSubject,
  })

  // We need a real DID document created by an account for this
  // Either via Tangle or Storage
  try {
    PresentationValidator.validate(
      studentVP,
      student.account.document(),
      [university.account.document()],
      presentationValidationOptions,
      FailFast.AllErrors
    )
  } catch (err) {
    console.error(err);
    return res.sendStatus(HTTPCode.UNAUTHORIZED)
  }
  // Verify signature from credential
  // if (!university.account.document().verifyData(req.body, VerifierOptions.default())) {
  //   return res.sendStatus(HTTPCode.UNAUTHORIZED)
  // }

  return res.sendStatus(HTTPCode.OK)
}


export function handleHTTPError(err: HTTPError, req: Request, res: Response, next: NextFunction) {
  return res.status(err.statusCode).send(err.message)
}