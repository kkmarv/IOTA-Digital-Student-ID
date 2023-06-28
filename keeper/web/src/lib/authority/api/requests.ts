import { apiNames } from '../../apiNames'
import hasError from '../../requestValidation'

export async function getChallenge(authorityEndpoint: URL, did: string): Promise<{ challenge: string }> {
  const response = await fetch(authorityEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ did }),
  })
  if (await hasError(response, apiNames.authority)) return null
  return await response.json()
}

export async function sendVerifiablePresentation(authorityEndpoint: URL, presentation: any) {
  const response = await fetch(authorityEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: presentation,
  })
  if (await hasError(response, apiNames.authority)) return null
  return await response.json()
}

export async function getAccessToken(authorityEndpoint: URL, presentation: any) {
  const response = await fetch(authorityEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: presentation,
  })
  if (await hasError(response, apiNames.authority)) return null
  return await response.json()
}
