import config from '../../config'
import express, { NextFunction, Request, Response } from 'express'
import { IMatriculationData, isValid, digital } from '../../identity'
import { HTTPCode, HTTPError } from '../errors'


const apiRouter = express.Router()
apiRouter.use(express.json())


const university = (async function () { return await digital.UniversityID.load(config.didUrl, config.identityName) }())


// Register an endpoint for issuing Matriculation Credentials.
apiRouter.post('/credentials/matriculation/register', async (req: Request, res: Response) => {
  if (!isValid.registrationData(req.body)) throw new HTTPError(HTTPCode.BAD_REQUEST, 'Bad registration data.')
  const regData = req.body

  // Gather the credential information
  const matrData: IMatriculationData = {
    id: regData.id,
    university: config.identityName,
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
apiRouter.post('/credentials/matriculation/login', (req: Request, res: Response) => { })


// Custom error handling
apiRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Catch HTTPError and send its message as a response
  if (err instanceof HTTPError) return res.status(err.statusCode).send(err.message)
  next(err)
})

export default apiRouter