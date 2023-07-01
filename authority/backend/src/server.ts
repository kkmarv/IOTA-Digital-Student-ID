import identity from '@iota/identity-wasm/node/identity_wasm.js'
// import cookieParser from 'cookie-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { NationalIDCard, StudentIDCard } from '../../../typings'
import {
  apiPort,
  authorityConfig,
  challengeSize,
  challengeTimeout,
  credentialTypes,
  failureReasons,
  routes,
  tokenExpiresIn,
  tokenSecret,
} from '../config'
import authority from './authority.js'
import { randomString } from './helper.js'
import nextSemesterStart from './identity/util/time.js'
import { validateVP } from './middleware/bodyParsing'
import { authenticateJWT } from './middleware/jwt'

const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(cookieParser())
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
app.post(
  routes.issueStudentIDCredential,
  validateVP(credentialTypes.nationalID),
  async (req: Request, res: Response) => {
    const { credential, holderDid, program } = req.body

    const studentPersonalData = credential.credentialSubject()[0] as unknown as NationalIDCard

    const studentStudyData: StudentIDCard = {
      student: {
        fullName: `${studentPersonalData.firstNames.join(' ')} ${studentPersonalData.lastName}`,
        photoURI: studentPersonalData.biometricPhotoURI,
      },
      studies: {
        fieldOfStudy: program ?? 'Computer Science',
        degreeTitle: 'Bachelor',
        universityName: authorityConfig.name,
        currentSemester: 1,
        studentID: Date.now(),
        enrollmentDate: new Date().toISOString(),
      },
    }

    const studentIDCredential = new identity.Credential({
      type: credentialTypes.studentID,
      issuer: authority.document().id(),
      credentialSubject: { id: holderDid, ...studentStudyData },
      issuanceDate: identity.Timestamp.nowUTC(),
      expirationDate: nextSemesterStart(),
      nonTransferable: true,
    })

    console.log(credential)

    const proofOptions = new identity.ProofOptions({
      purpose: identity.ProofPurpose.assertionMethod(),
    })

    const signingKey = authorityConfig.methodFragments.signStudentIDCredential
    const signedCredential = await authority.createSignedCredential(signingKey, studentIDCredential, proofOptions)
    console.log(signedCredential.toJSON())

    return res.status(200).send(signedCredential.toJSON())
  }
)

/** Verify a Verifiable Presentation containing a StudentIDCredential */
app.post(routes.verifyStudentIDCredential, validateVP(credentialTypes.studentID), (req: Request, res: Response) => {
  return res.sendStatus(204)
})

/** Verify a JWT cookie. */
// This is a temporary solution to verify the JWT cookie
// Remove this once the presentation is over
app.post(routes.authTokenVerify, authenticateJWT, (req: Request, res: Response) => {
  res.sendStatus(204)
})

/** Create a JWT cookie. Precondition is a valid Verifiable Presentation. */
app.post(routes.authTokenCreate, validateVP(credentialTypes.studentID), (req: Request, res: Response) => {
  const { holderDid } = req.body

  // Create JWT
  const accessToken = jwt.sign({}, tokenSecret, {
    audience: holderDid.toString(),
    expiresIn: tokenExpiresIn,
    issuer: authorityConfig.name,
    subject: holderDid.toString(),
  })

  // Set JWT as cookie
  // res.cookie('accessToken', accessToken, {
  //   httpOnly: false,
  //   secure: true,
  //   sameSite: true,
  // })

  // return res.sendStatus(204)

  return res.status(200).send({ accessToken })
})

app.listen(apiPort, () => {
  console.log(`authority API listening on port ${apiPort}`)
})
