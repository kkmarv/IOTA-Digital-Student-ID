import express from 'express'
import { handleHTTPError, login, register, sendChallenge } from './functions.js'


const apiRouter = express.Router()

apiRouter.use(express.json())
apiRouter.post('/challenge', sendChallenge)
// Endpoint for issuing StudentCredentials.
apiRouter.post('/student/register', register)
// Endpoint for logging in via StudentCredential.
apiRouter.post('/student/login', login)
// Custom error handling
apiRouter.use(handleHTTPError)

export default apiRouter