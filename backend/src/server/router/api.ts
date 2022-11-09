import cfg from '../../config.js'
import express, { NextFunction, Request, Response } from 'express'
import { IMatriculationData, isValid, digital } from '../../identity/index.js'
import { HTTPCode, HTTPError } from '../errors.js'


const apiRouter = express.Router()
const institution = cfg.institution
// Load the DID if URL was found in env variables, else create new identity
const university = (async function () {
  if (institution.did) return await digital.UniversityID.load(institution.did, institution.name, institution.website)
  else return await digital.UniversityID.new(institution.name, institution.website)
}())


apiRouter.use(express.json())

// Register an endpoint for issuing Matriculation Credentials.
apiRouter.post('/credentials/matriculation/register',
  async (req: Request, res: Response) => {
    if (!isValid.registrationData(req.body)) {
      throw new HTTPError(HTTPCode.BAD_REQUEST, 'Bad registration data.')
    }
    const regData = req.body

    // Gather the credential information
    const matrData: IMatriculationData = {
      id: regData.id,
      university: cfg.institution.name,
      degree: regData.degree,
      courseOfStudy: regData.courseOfStudy,
      matriculationNumber: Date.now(),
      semester: 1
    }

      ; (await university).issueMatriculationVC(matrData, regData.challenge).then((credential) => {
        return res.status(HTTPCode.OK).send(credential)
      })
  })

// TODO
apiRouter.post('/credentials/matriculation/login',
  (req: Request, res: Response) => { })

// Custom error handling
apiRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Catch HTTPError and send its message as a response
    if (err instanceof HTTPError) {
      return res.status(err.statusCode).send(err.message)
    }
    next(err)
  }
)

export default apiRouter