import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { failureReasons, tokenSecret } from '../../config'

/** Middleware that authenticates a JWT and inserts its contents into the request body. */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const { accessToken } = req.body

  if (!accessToken) {
    return res.status(400).json({ reason: failureReasons.jwtMissing })
  }

  jwt.verify(accessToken, tokenSecret, (err: jwt.VerifyErrors | null, jwtPayload: any) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(403).json({ reason: failureReasons.jwtExpired })
      } else {
        return res.status(401).json({ reason: failureReasons.jwtInvalid })
      }
    }

    // Insert JWT contents into the request for further processing
    req.body.did = jwtPayload.sub
    req.body.username = jwtPayload.username

    return next()
  })
}
