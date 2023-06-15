export default async function hasError(response: Response, apiName?: string): Promise<string> {
  if (!response) return 'Network error.'
  else if (!response.ok) {
    const body = await response.json()
    console.error(`${apiName ? apiName : 'Reason'}: ${body.reason}`)
    return body.reason
  }
  return null
}
