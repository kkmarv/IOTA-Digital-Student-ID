import cfg from '../../config.js'
import crypto from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import { IMatriculationData, isValid, digital, UniversityDegree } from '../../identity/index.js'
import { HTTPCode, HTTPError } from '../errors.js'


const apiRouter = express.Router()
const institution = cfg.institution
// Load the DID if URL was found in env variables, else create new identity
const university = institution.did ? await digital.UniversityID.load(institution.did, institution.name, institution.website) : await digital.UniversityID.new(institution.name, institution.website)


apiRouter.use(express.json())

apiRouter.get('/challenge',
  (req: Request, res: Response) => {
    return res.status(HTTPCode.OK).send(crypto.randomBytes(32).toString('hex'))
  }
)

// Register an endpoint for issuing Matriculation Credentials.
apiRouter.post('/student/register',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!isValid.registrationData(req.body)) {
      console.log(req.body);
      
      next(new HTTPError(HTTPCode.BAD_REQUEST, 'Bad registration data.'))
    } else {
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
  }
)

// TODO
apiRouter.post('/student/login',
  (req: Request, res: Response) => { })

// Custom error handling
apiRouter.use(
  (err: HTTPError, req: Request, res: Response, next: NextFunction) => {
    return res.status(err.statusCode).send(err.message)
  }
)

export default apiRouter