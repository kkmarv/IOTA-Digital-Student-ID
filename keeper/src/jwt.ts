import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { hostname } from 'os'
import { FAILURE_REASONS, TOKEN_EXPIRES_IN, TOKEN_SECRET } from './constants.js'

export function issueJWT(username: string) {
  return jwt.sign({ username: username }, TOKEN_SECRET, {
    subject: username,
    audience: 'https://keeper.local',
    issuer: `keeper@${hostname()}`,
    expiresIn: TOKEN_EXPIRES_IN,
  })
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(400).json({ reason: FAILURE_REASONS.jwtMissing })
  }

  // Remove the 'Bearer' keyword and verify the token
  const token = authHeader.replace('Bearer ', '')
  jwt.verify(token, TOKEN_SECRET, (err, jwtPayload) => {
    if (err) {
      return res.status(401).json({ reason: FAILURE_REASONS.jwtInvalid })
    }

    // Insert JWT contents into request for further processing
    req.body.jwtPayload = jwtPayload

    return next()
  })
}
