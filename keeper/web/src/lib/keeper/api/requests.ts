import hasError from '../../requestValidation'
import * as route from './routes'

export async function createAccessToken(username: string, password: string): Promise<boolean> {
  const response = await fetch(route.createAccessToken, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password }),
  })
  return !(await hasError(response))
}

export async function verifyAccessToken(): Promise<boolean> {
  const response = await fetch(route.verifyAccessToken, {
    method: 'GET',
    credentials: 'include',
  })
  return !(await hasError(response))
}

export async function signData(data: any, password: string): Promise<any> {
  const response = await fetch(route.signData, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password, challenge: data }),
  })
  if (await hasError(response)) return null
  return await response.json()
}

export async function register(username: string, password: string): Promise<boolean> {
  const response = await fetch(route.registerNewUser, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password }),
  })
  return !(await hasError(response))
}

export async function logout(): Promise<boolean> {
  const response = await fetch(route.deleteAccessToken, {
    method: 'GET',
    credentials: 'include',
  })
  return !(await hasError(response))
}

export async function getDid(password: string): Promise<any> {
  const response = await fetch(route.getDid, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password }),
  })
  if (await hasError(response)) return null
  return await response.json()
}
