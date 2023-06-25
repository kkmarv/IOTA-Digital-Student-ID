import identity from '@iota/identity-wasm/node/identity_wasm.js'
// import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import { NationalIDCard, StudentIDCard } from '../../../typings'
import {
  apiPort,
  authorityConfig,
  challengeSize,
  challengeTimeout,
  credentialTypes,
  failureReasons,
  routes,
} from '../config'
import authority from './authority.js'
import { randomString } from './helper.js'
import nextSemesterStart from './identity/util/time.js'
import { validateVP } from './middleware'

// import { authenticateJWT, issueJWT } from './jwt.js'

const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(express.json())

// A Map to save DID <-> challenge pairs
export const challenges = new Map<string, { challenge: string; timestamp: number }>()

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
    return res.status(400).send({ reason: failureReasons.didMissing })
  }

  try {
    identity.DID.parse(did)
  } catch (error) {
    return res.status(400).send({ reason: failureReasons.didParsingFailed })
  }

  // Generate a random string and save it to the challenges Map
  const challenge = randomString(challengeSize)
  challenges.set(did, { challenge, timestamp: Date.now() })

  res.status(200).send({ challenge: challenge })
})

/** Issue a StudentIDCredential */
app.post(routes.issueStudentIDCredential, validateVP, async (req: Request, res: Response) => {
  const { credential, holder } = req.body

  const studentPersonalData = credential.credentialSubject()[0] as unknown as NationalIDCard

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

  const studentIDCredential = new identity.Credential({
    // id: undefined, // FIXME necessary?
    type: credentialTypes.studentID,
    issuer: authority.document().id(),
    credentialSubject: { id: holder, ...studentStudyData },
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
    // refreshService: { id: authorityConfig.website, types: 'StudentIDCredential' },
    nonTransferable: true,
  })

  console.log(credential)

  const proofOptions = new identity.ProofOptions({
    purpose: identity.ProofPurpose.assertionMethod(),
  })

  const signedCredential = await authority.createSignedCredential(
    authorityConfig.methodFragments.signStudentIDCredential,
    studentIDCredential,
    proofOptions
  )

  return res.status(200).send(signedCredential.toJSON())
})

/** Verify a Verifiable Presentation of a StudentIDCredential */
app.post(routes.verifyStudentIDCredential, validateVP, async (req: Request, res: Response) => {
  return res.sendStatus(204)
})

app.listen(apiPort, () => {
  console.log(`authority API listening on port ${apiPort}`)
})
