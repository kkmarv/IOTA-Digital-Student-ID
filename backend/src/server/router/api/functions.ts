import {
  CredentialValidationOptions,
  DID,
  Duration,
  FailFast,
  Presentation,
  PresentationValidationOptions,
  Resolver,
  SubjectHolderRelationship,
  VerifierOptions
} from '@iota/identity-wasm/node/identity_wasm.js'
import assert from 'assert'
import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import cfg from '../../../config.js'
import { digital } from '../../../identity/index.js'
import { RegistrationData, StudyData } from '../../../identity/subjects/Matriculation.js'
import nextSemesterStart from '../../../identity/util/time.js'
import { HTTPCode, HTTPError } from '../../errors.js'

type did = string
type challenge = string

// Using the map as a primitive solution to store access tokens
const CHALLENGE_MAP = new Map<did, challenge>()
const TANGLE_RESOLVER = await Resolver.builder().clientConfig(cfg.iota.clientConfig).build();

// Load the DID of the institution
// if a DID URL was found in env variables, else create a new identity
const INSTITUTION = cfg.institution
const UNIVERSITY = INSTITUTION.did ?
  await digital.UniversityID.load(INSTITUTION.did) :
  await digital.UniversityID.new(INSTITUTION.name, INSTITUTION.website)
console.dir(UNIVERSITY.toJSON(), { depth: null });


export function sendChallenge(req: Request, res: Response, next: NextFunction) {
  res.setHeader('content-type', 'text/plain')
  const did = req.body.id

  // Verify that a DID was given
  if (!did) {
    return next(new HTTPError(HTTPCode.BAD_REQUEST, "Missing DID."))
  }

  // Validate DID
  try {
    DID.parse(did)
  } catch (err) {
    console.error(err);
    return next(new HTTPError(HTTPCode.BAD_REQUEST, "Not a valid DID."))
  }

  const challenge = crypto.randomBytes(32).toString('hex')
  CHALLENGE_MAP.set(did, challenge)

  return res.status(HTTPCode.OK).send(challenge)
}


// Registering = Creating VC
export async function register(req: Request, res: Response, next: NextFunction) {
  const registrationData = RegistrationData.fromJSON(req.body)

  if (registrationData === null) {
    return next(new HTTPError(HTTPCode.UNPROCESSABLE_ENTITY, 'Bad registration data.'))
  }

  // Did the requesting DID acquire a challenge before?
  if (!CHALLENGE_MAP.has(registrationData.id.toString())) {
    return next(new HTTPError(HTTPCode.UNAUTHORIZED, "Please get a challenge first."))
  }

  const studyData = new StudyData(
    registrationData,
    {
      currentTerm: 1,
      matriculationNumber: Date.now(),
      providerName: cfg.institution.name
    }
  )

  const signedStudentVC = await UNIVERSITY.issueStudentVC(studyData)

  return res.status(HTTPCode.OK).send(signedStudentVC.toJSON())
}


// Login = Verifying VP
export async function login(req: Request, res: Response, next: NextFunction) {
  let studentVP: Presentation
  let studentDID: DID

  // Verify that the request body is a VP
  // Using try-catch clauses because IOTA lib just errors because it feels like it
  try {
    studentVP = Presentation.fromJSON(req.body)
    assert(studentVP.type() !== undefined, "Type property missing.")
    assert(studentVP.holder() !== undefined, "Holder property missing.")
    assert(studentVP.verifiableCredential() !== undefined, "Credential property missing.")
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return next(new HTTPError(HTTPCode.BAD_REQUEST, "Not a verifiable presentation:\n" + err.message))
    } else {
      return next(new HTTPError(HTTPCode.BAD_REQUEST, "Not a verifiable presentation."))
    }
  }

  // Parse DID
  try {
    studentDID = DID.parse(studentVP.holder()!)
  } catch (err) {
    console.error(err);
    return next(new HTTPError(HTTPCode.UNPROCESSABLE_ENTITY, "Presentation contains invalid DID."))
  }

  // Define constraints for presentation validation
  const presentationValidationOptions = new PresentationValidationOptions({
    // The presentation owner must be the credential subject 
    subjectHolderRelationship: SubjectHolderRelationship.AlwaysSubject,
    presentationVerifierOptions: new VerifierOptions({
      challenge: CHALLENGE_MAP.get(studentDID.toString()),
      // Do not allow expired signatures ever
      allowExpired: false
    }),
    sharedValidationOptions: new CredentialValidationOptions({
      // Tolerate expired credentials by 1 hour past midnight
      earliestExpiryDate: nextSemesterStart().checkedAdd(Duration.hours(1))
    })
  })

  try {
    await TANGLE_RESOLVER.verifyPresentation(
      studentVP,
      presentationValidationOptions,
      FailFast.FirstError // FirstError is more readable in error messages than AllErrors
    )
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return next(new HTTPError(HTTPCode.UNAUTHORIZED, err.message))
    } else {
      return next(new HTTPError(HTTPCode.UNAUTHORIZED))
    }
  }

  // All checks passed: The presentation is valid.
  return res.sendStatus(HTTPCode.OK)
}


export function handleHTTPError(err: HTTPError, req: Request, res: Response, next: NextFunction) {
  return res.status(err.statusCode).send(err.message)
}