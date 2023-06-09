import identity from '@iota/identity-wasm/node/identity_wasm.js'
// import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import { apiPort, authorityConfig, credentialTypes, routes } from './config.js'
import { randomString } from './helper.js'
import authority from './authority.js'
import nextSemesterStart from './identity/util/time.js'

// import { authenticateJWT, issueJWT } from './jwt.js'

const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(express.json())

/** Get a random challenge */
app.get(routes.challenge, (req: Request, res: Response) => {
  res.status(200).send({ challenge: randomString(64) })
})

/** Request information about the StudentIDCredential requirements */
app.get(routes.studentIDCredentialRequirements, (req: Request, res: Response) => {
  res.status(200).send({ requirements: [credentialTypes.nationalID] })
})

/** Issue a StudentIDCredential */
app.post(routes.issueStudentIDCredential, async (req: Request, res: Response) => {
  const { cardSubject, credentialkek } = req.body

  const credential = new identity.Credential({
    type: credentialTypes.studentID,
    issuer: authority.document().id(),
    credentialSubject: cardSubject,
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
