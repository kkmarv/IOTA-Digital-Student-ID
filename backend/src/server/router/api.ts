import cfg from '../../config.js'
import crypto from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import { digital } from '../../identity/index.js'
import { HTTPCode, HTTPError } from '../errors.js'
import { Presentation, VerifierOptions } from '@iota/identity-wasm/node/identity_wasm.js'
import { MatriculationData, RegistrationData } from '../../identity/subjects/Matriculation.js'


const institution = cfg.institution
// Load the DID if a DID URL was found in env variables, else create a new identity
const university = institution.did ?
  await digital.UniversityID.load(institution.did, institution.name, institution.website) :
  await digital.UniversityID.new(institution.name, institution.website)

const apiRouter = express.Router()


apiRouter.use(express.json())

apiRouter.get('/challenge',
  (req: Request, res: Response) => {
    res.setHeader('content-type', 'text/plain')
    return res.status(HTTPCode.OK).send(crypto.randomBytes(32).toString('hex'))
  }
)

// Endpoint for issuing StudentCredentials.
apiRouter.post('/student/register',
  async (req: Request, res: Response, next: NextFunction) => {

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
)

// Endpoint for logging in via StudentCredential.
apiRouter.post('/student/login',
  (req: Request, res: Response, next: NextFunction) => {
    Presentation.fromJSON(req.body)

    // Verify signature from credential
    if (!university.account.document().verifyData(req.body, VerifierOptions.default())) {
      return res.sendStatus(HTTPCode.UNAUTHORIZED)
    }
    return res.sendStatus(HTTPCode.OK)
  }
)

// Custom error handling
apiRouter.use(
  (err: HTTPError, req: Request, res: Response, next: NextFunction) => {
    return res.status(err.statusCode).send(err.message)
  }
)

export default apiRouter