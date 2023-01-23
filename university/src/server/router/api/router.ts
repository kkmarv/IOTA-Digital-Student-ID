import express from 'express'
import { handleHTTPError, login, register, sendChallenge } from './functions.js'

const apiRouter = express.Router()
apiRouter.use(express.json())

/** Endpoint for sending arbitrary challenge texts. */
apiRouter.post('/challenge', sendChallenge)

/** Endpoint for issuing StudentCredentials. */
apiRouter.post('/student/register', register)

/** Endpoint for logging in via Verifiable Presentation of a StudentCredential. */
apiRouter.post('/student/login', login)

/** Custom error handling */
apiRouter.use(handleHTTPError)

export default apiRouter