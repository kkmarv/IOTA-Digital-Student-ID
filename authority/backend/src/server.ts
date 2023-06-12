import identity from '@iota/identity-wasm/node/identity_wasm.js'
// import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import authority from './authority.js'
import { apiPort, authorityConfig, clientConfig, credentialTypes, routes } from './config.js'
import { randomString } from './helper.js'
import nextSemesterStart from './identity/util/time.js'
import { NationalIDCard, StudentIDCard } from '../../../typings'

// import { authenticateJWT, issueJWT } from './jwt.js'

const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(express.json())

// A Map to save DID <-> challenge pairs
const challenges = new Map<string, { challenge: string; timestamp: number }>()
const challengeTimeout = 1000 * 60 * 10 // 10 minutes

const resolver = await new identity.ResolverBuilder().clientConfig(clientConfig).build()

// Periodically clean up expired challenges
setInterval(() => {
  const now = Date.now()
  for (const [did, { timestamp }] of challenges.entries()) {
    if (now - timestamp > challengeTimeout) {
      challenges.delete(did)
    }
  }
}, challengeTimeout)

/** Get a random challenge by providing your DID */
app.post(routes.challenge, (req: Request, res: Response) => {
  const { did } = req.body

  if (!did) {
    return res.status(400).send({ reason: 'Missing DID' })
  }

  try {
    identity.DID.parse(did)
  } catch (error) {
    return res.status(400).send({ reason: 'Not an IOTA DID' })
  }

  // Generate a random string and save it to the challenges Map
  const challenge = randomString(64)
  challenges.set(did, { challenge, timestamp: Date.now() })

  res.status(200).send({ challenge: challenge })
})

/** Request information about the StudentIDCredential requirements */
app.get(routes.studentIDCredentialRequirements, (req: Request, res: Response) => {
  res.status(200).send({ requirements: [credentialTypes.nationalID] })
})

/** Issue a StudentIDCredential */
app.post(routes.issueStudentIDCredential, async (req: Request, res: Response) => {
  let presentation: identity.Presentation
  // Parse the request body
  try {
    presentation = identity.Presentation.fromJSON(req.body)
  } catch (error) {
    if (error instanceof Error) return res.status(400).send({ reason: error.message })
    else return res.status(400).send({ reason: 'Not a Verifiable Presentation' })
  }

  // First, we need to validate the request body

  const didHolder = presentation.holder()
  if (!didHolder) {
    return res.status(400).send({ reason: 'No holder provided' })
  }

  const credentials = presentation.verifiableCredential()
  if (credentials.length === 0) {
    return res.status(400).send({ reason: 'No Verifiable Credential provided' })
  }

  const studentIDCredential = credentials[0]
  if (!studentIDCredential.type().includes(credentialTypes.nationalID)) {
    return res.status(415).send({ reason: `No ${credentialTypes.nationalID} found` })
  }

  // Second, we need to validate the presentation

  const presentationValidationOptions = new identity.PresentationValidationOptions({
    subjectHolderRelationship: identity.SubjectHolderRelationship.AlwaysSubject, // must be subject of all credentials
    presentationVerifierOptions: new identity.VerifierOptions({
      purpose: identity.ProofPurpose.assertionMethod(), // must be signed by the holder (student)
      challenge: 'challenge', // must include a challenge and match the one we generated
      allowExpired: false, // credentials must not be expired
    }),
  })

  try {
    await resolver.verifyPresentation(presentation, presentationValidationOptions, identity.FailFast.AllErrors)
  } catch (error) {
    res.status(403)
    if (error instanceof Error) return res.send({ reason: error.message })
    else return res.send({ reason: 'Unknown validation error' })
  }

  // Then we can issue the credential

  const studentPersonalData = studentIDCredential.credentialSubject()[0] as unknown as NationalIDCard

  const studentStudyData: StudentIDCard = {
    student: {
      fullName: `${studentPersonalData.firstNames.join(' ')} ${studentPersonalData.lastName}`,
      photoURI: studentPersonalData.biometricPhotoURI,
    },
    studies: {
      fieldOfStudy: 'Computer Science',
      degreeTitle: 'Bachelor',
      universityName: authorityConfig.name,
      currentSemester: 1,
      studentID: Date.now(),
      enrollmentDate: new Date().toISOString(),
    },
  }

  const credential = new identity.Credential({
    type: credentialTypes.studentID,
    issuer: authority.document().id(),
    credentialSubject: {
      // id: undefined, // FIXME necessary?
      credentialSubject: studentStudyData,
      issuer: authority.document().id(),
      // credentialStatus: {
      //     id: issuer.id + '#', // TODO + revocationBitmapFragment,
      //     type: RevocationBitmap.type()
      // },
      issuanceDate: identity.Timestamp.nowUTC(),
      expirationDate: nextSemesterStart(),
      // credentialSchema: { // FIXME serde_json Error
      //   id: 'https://gitlab.hs-anhalt.de/stmosarw/projekt-anwendungsentwicklung/-/blob/backend/schemas/credentials/student.jsonld',
      //   types: 'StudentCredential'
      // },
      // termsOfUse: undefined, // TODO define tos
      refreshService: authorityConfig.website,
      nonTransferable: true,
    },
    expirationDate: nextSemesterStart(),
    nonTransferable: true,
  })

  const proofOptions = new identity.ProofOptions({
    purpose: identity.ProofPurpose.assertionMethod(),
  })

  const signedCredential = await authority.createSignedCredential(
    authorityConfig.methodFragments.signStudentIDCredential,
    credential,
    proofOptions
  )

  return res.status(200).send({ credential: signedCredential.toJSON() })
})

app.listen(apiPort, () => {
  console.log(`authority API listening on port ${apiPort}`)
})
