import { KEEPER_API_ROUTES } from "./constants"
import { hasError } from "./helper"

export const ACCESS_TOKEN_KEY = "accessToken"


export async function requestAccessToken(username: string, password: string): Promise<boolean> {
  const response = await fetch(KEEPER_API_ROUTES.createAccessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, password: password })
  })

  if (await hasError(response)) {
    return false
  }

  // Save JWT to local storage
  const body = await response.json()
  if (!body?.jwt) return false
  localStorage.setItem(ACCESS_TOKEN_KEY, body.jwt)

  return true
}

export async function verifyAccessToken(): Promise<boolean> {
  const accessTokenValue = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (!accessTokenValue) return false

  const response = await fetch(KEEPER_API_ROUTES.verifyAccessToken, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessTokenValue}` }
  })

  return !(await hasError(response))
}