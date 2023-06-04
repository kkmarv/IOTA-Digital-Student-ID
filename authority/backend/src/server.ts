import identity from '@iota/identity-wasm/node/identity_wasm.js'
// import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { API_BASE, FAILURE_REASONS, API_PORT, ROUTES } from './config.js'
import { randomString } from './helper.js'

// import { authenticateJWT, issueJWT } from './jwt.js'

const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(express.json())

app.get(ROUTES.challenge, (req: Request, res: Response) => {
  res.status(200).send({ challenge: randomString(64) })
})

app.get(ROUTES.needForCredential, (req: Request, res: Response) => {})

app.post(ROUTES.issueCredential, (req: Request, res: Response) => {})

app.listen(API_PORT, () => {
  console.log(`authority API listening on port ${API_PORT}`)
})
