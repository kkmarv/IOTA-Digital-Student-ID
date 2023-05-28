import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { hostname } from 'os'
import { FAILURE_REASONS, TOKEN_EXPIRES_IN, TOKEN_SECRET } from './config.js'

const keeperIdentifier = `keeper@${hostname()}`

/** Issues a JWT for the given username and DID. */
export function issueJWT(username: string, did: string) {
  return jwt.sign({ username: username }, TOKEN_SECRET, {
    audience: keeperIdentifier,
    expiresIn: TOKEN_EXPIRES_IN,
    issuer: keeperIdentifier,
    subject: did,
  })
}

/** Middleware that authenticates a JWT and inserts its contents into the request body. */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const { accessToken } = req.cookies

  if (!accessToken) {
    return res.status(400).json({ reason: FAILURE_REASONS.jwtMissing })
  }

  jwt.verify(accessToken, TOKEN_SECRET, (err: jwt.VerifyErrors | null, jwtPayload: any) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(403).json({ reason: FAILURE_REASONS.jwtExpired })
      } else {
        return res.status(401).json({ reason: FAILURE_REASONS.jwtInvalid })
      }
    }

    // Insert JWT contents into request for further processing
    req.body.did = jwtPayload.sub
    req.body.username = jwtPayload.username

    return next()
  })
}
