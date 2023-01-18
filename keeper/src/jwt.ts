import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken'

const TOKEN_SECRET = 'youraccesstokensecret';


export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Missing authorization header.');
  }

  // Remove the 'Bearer' keyword from the token.
  const token = authHeader.replace('Bearer ', '');

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid JWT Token.');
    }

    // Insert user data into request for further processing.
    req.body.user = user

    return next();
  });
};
