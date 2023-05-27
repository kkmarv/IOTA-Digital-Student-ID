import identity from '@iota/identity-wasm/node/identity_wasm.js'
import assert from 'assert'
import cors from 'cors'
import crypto from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import config from './config.js'
import { digital } from './identity/index.js'
import { RegistrationData, StudyData } from './identity/subjects/Matriculation.js'
import { API_ENDPOINT } from './constants.js'

const authority = express()
authority.disable('x-powered-by')
authority.use(cors())

type did = string
type challenge = string

// Using the map as a primitive solution to store access tokens
const challengeMap = new Map<did, challenge>()
const tangleResolver = await identity.Resolver.builder().clientConfig(config.iota.clientConfig).build()

// Load the DID of the institution if a DID URL was found in env variables, else create a new identity
const university = config.authority.did
  ? await digital.UniversityID.load(config.authority.did)
  : await digital.UniversityID.new(config.authority.name, config.authority.website)

console.dir(university.toJSON(), { depth: null })

authority.post('', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('content-type', 'text/plain')
  const did = req.body.id

  // Verify that a DID was given
  if (!did) {
    return res.status(400).json({ reason: 'Missing DID.' })
  }

  // Validate DID
  try {
    identity.DID.parse(did)
  } catch (err) {
    console.error(err)
    return res.status(422).json({ reason: 'Not a valid DID.' })
  }

  const challenge = crypto.randomBytes(32).toString('hex')
  challengeMap.set(did, challenge)

  return res.status(200).send(challenge)
})

// Registering = Creating VC
authority.post('', async (req: Request, res: Response, next: NextFunction) => {
  const registrationData = RegistrationData.fromJSON(req.body)

  if (registrationData === null) {
    return res.status(422).json({ reason: 'Bad registration data.' })
  }

  // Did the requesting DID acquire a challenge before?
  if (!challengeMap.has(registrationData.id.toString())) {
    return res.status(401).json({ reason: 'Please get a challenge first.' })
  }

  const studyData = new StudyData(registrationData, {
    currentTerm: 1,
    matriculationNumber: Date.now(),
    providerName: config.authority.name,
  })

  const signedStudentVC = await university.issueStudentVC(studyData)

  return res.status(200).send(signedStudentVC.toJSON())
})

// Login = Verifying VP
authority.post('', async (req: Request, res: Response, next: NextFunction) => {
  let studentVP: identity.Presentation
  let studentDID: identity.DID

  // Verify that the request body is a VP
  // Using try-catch clauses because IOTA lib just errors because it feels like it
  try {
    studentVP = identity.Presentation.fromJSON(req.body)
    assert(studentVP.type() !== undefined, 'Type property missing.')
    assert(studentVP.holder() !== undefined, 'Holder property missing.')
    assert(studentVP.verifiableCredential() !== undefined, 'Credential property missing.')
  } catch (err) {
    console.error(err)
    res.status(400)
    if (err instanceof Error) {
      return res.json({ reason: 'Not a verifiable presentation:\n' + err.message })
    } else {
      return res.json({ reason: 'Not a verifiable presentation.' })
    }
  }

  // Parse DID
  try {
    studentDID = identity.DID.parse(studentVP.holder()!)
  } catch (err) {
    console.error(err)
    return res.status(422).json({ reason: 'Presentation contains invalid DID.' })
  }

  // Define constraints for presentation validation
  const presentationValidationOptions = new identity.PresentationValidationOptions({
    // The presentation owner must be the credential subject
    subjectHolderRelationship: identity.SubjectHolderRelationship.AlwaysSubject,
    presentationVerifierOptions: new identity.VerifierOptions({
      challenge: challengeMap.get(studentDID.toString()),
      // Do not allow expired signatures ever
      allowExpired: false,
    }),
  })

  try {
    await tangleResolver.verifyPresentation(
      studentVP,
      presentationValidationOptions,
      identity.FailFast.FirstError // FirstError is more readable in error messages than AllErrors
    )
  } catch (err) {
    console.error(err)
    res.status(401)
    if (err instanceof Error) {
      return res.json({ reason: err.message })
    }
    return res.json()
  }

  // All checks passed: The presentation is valid.
  return res.sendStatus(200)
})

authority.listen(config.apiPort, () => {
  console.log(`Authority listening at http://localhost:${config.apiPort}${API_ENDPOINT}`)
})
