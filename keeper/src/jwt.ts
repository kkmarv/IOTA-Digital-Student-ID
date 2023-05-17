import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { hostname } from 'os'

const TOKEN_SECRET = 'youraccesstokensecret'
const TOKEN_EXPIRES_IN = '7d' // TODO make shorter

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
    return res.status(400).json('Missing authorization header.')
  }

  // Remove the 'Bearer' keyword from the token
  const token = authHeader.replace('Bearer ', '')

  jwt.verify(token, TOKEN_SECRET, (err, jwtPayload) => {
    if (err) {
      return res.status(401).json('Invalid JWT Token.')
    }

    // Insert user data into request for further processing
    req.body.jwtPayload = jwtPayload

    return next()
  })
}
