import hasError from '../../requestValidation'
import * as route from './routes'

/** Create an access token for the user.
 * @param username The username of the user.
 * @param password The password of the user.
 * @returns `True` if the access token was created successfully.
 *
 * `False` if one of the following is true:
 * - the user does not exist
 * - the password is incorrect
 * - an error ocurred
 * @remarks The access token is stored as a secure cookie in the browser.
 */
export async function loginUser(username: string, password: string): Promise<boolean> {
  const response = await fetch(route.createAccessToken, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password }),
  })
  return !(await hasError(response))
}

/** Verify the access token of the user.
 * @returns `True` if the access token is valid.
 *
 * `False` if one of the following is true:
 * - the access token is invalid
 * - an error ocurred
 */
export async function authenticateUser(): Promise<boolean> {
  const response = await fetch(route.verifyAccessToken, {
    method: 'GET',
    credentials: 'include',
  })
  return !(await hasError(response))
}

/** Sign arbitrary data with the user's private key.
 * @param data The data to sign.
 * @param password The password of the user.
 * @returns The signature of the data on success.
 *
 * `Null` if one of the following is true:
 * - the password is incorrect
 * - the data is deformed
 * - an error ocurred
 */
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

/** Register a new user.
 * @param username The username of the user.
 * @param password The password of the user.
 * @returns `True` if the user was registered successfully.
 *
 * `False` if the user already exists or an error ocurred.
 */
export async function registerUser(username: string, password: string): Promise<boolean> {
  const response = await fetch(route.registerNewUser, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password }),
  })
  return !(await hasError(response))
}

/** Logout the user.
 * @returns `True` if the user was logged out successfully.
 *
 * `False` if an error ocurred.
 */
export async function logout(): Promise<boolean> {
  const response = await fetch(route.deleteAccessToken, {
    method: 'GET',
    credentials: 'include',
  })
  return !(await hasError(response))
}

/** Get the DID of the user.
 * @param password The password of the user.
 * @returns The DID of the user on success.
 *
 * `Null` if one of the following is true:
 * - the password is incorrect
 * - an error ocurred
 */
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

export async function getCredential(credentialName: string) {
  const response = await fetch(route.getVerifiableCredential + '/' + credentialName, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  if (await hasError(response)) return null
  return await response.json()
}

/** Save a Verifiable Credential to keeper.
 * @param password The password of the user.
 * @param credentialName A unique name for the credential.
 * @param credential The Verifiable Credential to save.
 * @returns `True` if the credential was saved successfully.
 *
 * `False` if one of the following is true:
 * - the password is incorrect
 * - the user does not exist
 * - a credential with the given name already exists for this user
 * - an error ocurred
 */
export async function saveCredential(password: string, credentialName: string, credential: any): Promise<boolean> {
  const response = await fetch(route.storeVerifiableCredential, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password, credentialName: credentialName, verifiableCredential: credential }),
  })
  return !(await hasError(response))
}
