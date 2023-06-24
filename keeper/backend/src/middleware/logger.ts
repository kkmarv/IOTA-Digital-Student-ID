import { NextFunction, Request, Response } from 'express'

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${new Date().toISOString()}: ${req.method} ${req.url}`)
  next()
}
