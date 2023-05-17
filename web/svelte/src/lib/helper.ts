export async function hasError(response: Response): Promise<string> {
  if (!response) return 'Network error.'
  else if (!response.ok) {
    const body = await response.json()
    console.error(`Keeper: ${body.reason}`)
    return body.reason
  }
  return null
}

