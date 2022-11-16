import cfg from '../../config.js'
import crypto from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import { IMatriculationData, isValid, digital } from '../../identity/index.js'
import { HTTPCode, HTTPError } from '../errors.js'


const institution = cfg.institution
// Load the DID if a DID URL was found in env variables, else create a new identity
const university = institution.did ?
  await digital.UniversityID.load(institution.did, institution.name, institution.website) :
  await digital.UniversityID.new(institution.name, institution.website)

const apiRouter = express.Router()


apiRouter.use(express.json())

apiRouter.get('/challenge',
  (req: Request, res: Response) => {
    return res.status(HTTPCode.OK).send(crypto.randomBytes(32).toString('hex'))
  }
)

// Endpoint for issuing StudentCredentials.
apiRouter.post('/student/register',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!isValid.registrationData(req.body)) {
      next(new HTTPError(HTTPCode.UNPROCESSABLE_CONTENT, 'Bad data format.'))
      return
    }

    const regData = req.body

    // Gather the credential information
    const matrData: IMatriculationData = {
      id: regData.id,
      providerName: cfg.institution.name,
      currentTerm: 1,
      matriculationNumber: Date.now(),
      studySubject: regData.studySubject,
      student: regData.student
    }

    return res.status(HTTPCode.OK).send(
      await university.issueMatriculationVC(matrData, regData.challengeSignature)
    )
  }
)

// Endpoint for logging in via StudentCredential.
apiRouter.post('/student/login',
  (req: Request, res: Response, next: NextFunction) => {
    if (!isValid.studentCredential(req.body)) {
      next(new HTTPError(HTTPCode.UNPROCESSABLE_CONTENT, 'Bad Credential.'))
      return
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