import { KEEPER_API_ROUTES } from './constants'
import { hasError } from './helper'

export async function requestAccessToken(username: string, password: string): Promise<boolean> {
  const response = await fetch(KEEPER_API_ROUTES.createAccessToken, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password }),
  })
  return !(await hasError(response))
}

export async function verifyAccessToken(): Promise<boolean> {
  const response = await fetch(KEEPER_API_ROUTES.verifyAccessToken, {
    method: 'GET',
    credentials: 'include',
  })
  return !(await hasError(response))
}
