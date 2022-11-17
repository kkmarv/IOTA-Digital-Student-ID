import cfg from '../../../config.js'
import crypto from 'crypto'
import { Presentation, VerifierOptions } from '@iota/identity-wasm/node/identity_wasm.js'
import { NextFunction, Request, Response } from 'express'
import { digital } from '../../../identity/index.js'
import { MatriculationData, RegistrationData } from '../../../identity/subjects/Matriculation.js'
import { HTTPCode, HTTPError } from '../../errors.js'


// Load the DID of the institution
// if a DID URL was found in env variables, else create a new identity
const institution = cfg.institution
const university = institution.did ?
  await digital.UniversityID.load(institution.did, institution.name, institution.website) :
  await digital.UniversityID.new(institution.name, institution.website)


export function sendChallenge(req: Request, res: Response) {
  res.setHeader('content-type', 'text/plain')
  return res.status(HTTPCode.OK).send(crypto.randomBytes(32).toString('hex'))
}


export async function register(req: Request, res: Response, next: NextFunction) {
  const registrationData = RegistrationData.fromJSON(req.body)

  if (registrationData === null) {
    return next(new HTTPError(HTTPCode.UNPROCESSABLE_CONTENT, 'Bad registration data.'))
  }

  const matriculationData = new MatriculationData(
    registrationData, {
    currentTerm: 1,
    matriculationNumber: Date.now(),
    providerName: cfg.institution.name
  })

  const signedStudentVC = await university.issueStudentVC(matriculationData)
  return res.status(HTTPCode.OK).send(signedStudentVC.toJSON())
}


export function login(req: Request, res: Response, next: NextFunction) {
  Presentation.fromJSON(req.body)

  // Verify signature from credential
  if (!university.account.document().verifyData(req.body, VerifierOptions.default())) {
    return res.sendStatus(HTTPCode.UNAUTHORIZED)
  }
  return res.sendStatus(HTTPCode.OK)
}


export function handleHTTPError(err: HTTPError, req: Request, res: Response, next: NextFunction) {
  return res.status(err.statusCode).send(err.message)
}