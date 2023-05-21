import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { hostname } from 'os'
import { FAILURE_REASONS, TOKEN_EXPIRES_IN, TOKEN_SECRET } from './constants.js'

const keeperIdentifier = `keeper@${hostname()}`

export function issueJWT(username: string) {
  return jwt.sign({}, TOKEN_SECRET, {
    audience: keeperIdentifier,
    expiresIn: TOKEN_EXPIRES_IN,
    issuer: keeperIdentifier,
    subject: username,
  })
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies?.accessToken

  jwt.verify(accessToken, TOKEN_SECRET, (err: Error | null, jwtPayload?: JwtPayload | string) => {
    if (!jwtPayload) {
      return res.status(400).json({ reason: FAILURE_REASONS.jwtMissing })
    } else if (err) {
      return res.status(401).json({ reason: FAILURE_REASONS.jwtInvalid })
    }

    // Insert JWT contents into request for further processing
    req.body.username = jwtPayload.sub

    return next()
  })
}
