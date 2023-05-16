import type { httpMethod } from './types'


export async function fetchApi(
  method: httpMethod,
  url: string,
  additionalHeaders: HeadersInit = null,
  body?: BodyInit
): Promise<Response> {
  let response: Response
  const headers = {
    "Content-Type": "application/json",
    ...additionalHeaders
  }

  console.log(`Requesting ${method} ${url}`)
  console.dir(headers, { colors: true })
  console.dir(body, { colors: true })

  try {
    response = await fetch(url, {
      method: method,
      headers: headers,
      body: body,
    })
  } catch (error) {
    console.error(`Error requesting ${method} ${url}: `, error.message)
  }

  isResponseSuccessful(response)
  return response
}

async function isResponseSuccessful(response?: Response) {
  if (!response?.ok) {
    console.log(response)
    return
  }
}

