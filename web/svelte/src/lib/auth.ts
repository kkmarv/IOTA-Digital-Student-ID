import { KEEPER_API_ROUTES } from "./constants"

export const ACCESS_TOKEN_KEY = "accessToken"
export const ACCESS_TOKEN_VALUE = localStorage.getItem(ACCESS_TOKEN_KEY)


export async function requestAccessToken(username: string, password: string): Promise<boolean> {
  const response = await fetch(KEEPER_API_ROUTES.createAccessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, password: password })
  })

  // Save JWT to local storage
  if (response?.ok) {
    const body = await response.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, body.jwt)
    localStorage.getItem(ACCESS_TOKEN_KEY)
    return true
  }
  return false
}

export async function verifyAccessToken(): Promise<boolean> {
  if (!ACCESS_TOKEN_VALUE) return false

  const response = await fetch(KEEPER_API_ROUTES.verifyAccessToken, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN_VALUE}` }
  })
  return response?.ok
}