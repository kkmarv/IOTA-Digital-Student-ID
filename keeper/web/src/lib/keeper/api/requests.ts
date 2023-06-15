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
    body: JSON.stringify({ username, password }),
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
 * @param password The password of the user.
 * @param data The data to sign.
 * @param challenge The challenge to include in the signature.
 * @returns The signature of the data on success.
 *
 * `Null` if one of the following is true:
 * - the password is incorrect
 * - the data is deformed
 * - an error ocurred
 */
export async function signData(password: string, data?: any, challenge?: string): Promise<any> {
  const response = await fetch(route.signData, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, data, challenge }),
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
    body: JSON.stringify({ username, password }),
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
    body: JSON.stringify({ password, credentialName, verifiableCredential: credential }),
  })
  return !(await hasError(response))
}

/** Create a Verifiable Presentation from multiple Verifiable Credentials saved within keeper.
 * @param password The password of the user.
 * @param credentialNames The names of the Verifiable Credentials to include in the Verifiable Presentation.
 * @param challenge A challenge to include in the Verifiable Presentation.
 * @returns The Verifiable Presentation on success.
 *
 * `Null` if one of the following is true:
 * - the password is incorrect
 * - a credential with one of the given names does not exist for this user
 * - an error ocurred
 */
export async function createPresentation(
  password: string,
  credentialNames: string[],
  challenge?: string
): Promise<any> {
  const response = await fetch(route.createVerifiablePresentation, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, credentialNames, challenge }),
  })
  if (await hasError(response)) return null
  return await response.json()
}
