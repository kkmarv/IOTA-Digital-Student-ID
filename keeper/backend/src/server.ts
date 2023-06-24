import identity from '@iota/identity-wasm/node/identity_wasm.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { apiBase, apiPort, corsOptions, failureReasons, routes } from './config/api.config.js'
import { accountBuilderConfig, keeperConfig } from './config/identity.config.js'
import { decryptCredential, encryptCredential } from './encryption.js'
import {
  UserCredentials,
  buildStronghold,
  isUserCredentials,
  isVerifiableCredential,
  retrieveAccount,
  userDirectory,
} from './helper.js'
import { authenticateJWT, issueJWT } from './middleware/jwt.js'
import { logger } from './middleware/logger.js'

// WebServer setup
const app = express()
app.disable('x-powered-by')
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(logger)
// TODO look into using helmet

/** Create a JWT cookie. */
app.post(routes.authTokenCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).send({ reason: failureReasons.credentialsMissing })
  }

  const { username, password } = req.body
  const stronghold = await buildStronghold(username, password)

  if (stronghold === null) {
    return res.status(401).send({ reason: failureReasons.credentialsWrong })
  }

  // Abort if Stronghold does not contain exactly one DID - normally this should never happen
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).send({ reason: failureReasons.didDuplicate })
  }

  // Create JWT and set a cookie
  const accessToken = issueJWT(username, didList[0])
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: true,
  })

  return res.sendStatus(204)
})

/** Verify a JWT cookie. */
app.get(routes.authTokenVerify, authenticateJWT, async (req: Request, res: Response) => {
  res.sendStatus(204)
})

/** Delete a JWT cookie. */
app.get(routes.authTokenDelete, authenticateJWT, async (req: Request, res: Response) => {
  res.clearCookie('accessToken').sendStatus(204)
})

/** Create a DID from a username and password. */
app.put(routes.didCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).send({ reason: failureReasons.credentialsMissing })
  }

  const { username, password } = req.body as UserCredentials
  const stronghold = await buildStronghold(username, password, false)

  if (!stronghold) {
    return res.status(409).send({ reason: failureReasons.userDuplicate })
  }

  // Abort if Stronghold already contains a DID
  // Means that this exact user has registered already
  const didList = await stronghold.didList()
  if (didList.length != 0) {
    return res.status(409).send({ reason: failureReasons.userDuplicate })
  }

  const builder = new identity.AccountBuilder({
    autopublish: accountBuilderConfig.autopublish,
    autosave: accountBuilderConfig.autosave,
    clientConfig: accountBuilderConfig.clientConfig,
    storage: stronghold,
  })

  const account = await builder.createIdentity()

  await account.createMethod({
    fragment: keeperConfig.exchangeKeyFragment,
    scope: identity.MethodScope.KeyAgreement(),
    content: identity.MethodContent.GenerateX25519(),
  })

  // Publish the DID document to the Tangle
  // Fails if client cannot connect establish a connection
  try {
    await account.publish()
  } catch (err) {
    console.error(err)
    return res.status(503).send({ reason: failureReasons.tangleNoConnection })
  }

  console.dir(account.document().toJSON(), { depth: null })

  return res.sendStatus(204)
})

/** Get your DID. */
app.get(routes.didGet, authenticateJWT, async (req: Request, res: Response) => {
  const { did } = req.body
  return res.status(200).send({ did })
})

/** Sign arbitrary data. */
app.post(routes.didSign, authenticateJWT, async (req: Request, res: Response) => {
  const { username, password, did, data, challenge } = req.body

  if (!password) {
    return res.status(400).send({ reason: failureReasons.passwordMissing })
  }

  const stronghold = await buildStronghold(username, password)
  if (!stronghold) {
    return res.status(401).send({ reason: failureReasons.passwordWrong })
  }

  const proof = new identity.ProofOptions({
    challenge: challenge,
    purpose: identity.ProofPurpose.authentication(),
    expires: identity.Timestamp.nowUTC().checkedAdd(identity.Duration.minutes(10)),
  })

  const account = await retrieveAccount(identity.DID.parse(did), stronghold)
  const signedData = await account.createSignedData(keeperConfig.arbitrarySigningKeyFragment, { data }, proof)
  console.log(signedData)

  return res.status(200).send({ signedData: signedData })
})

/** Store a Verifiable Credential. */
app.put(routes.credentialStore, authenticateJWT, async (req: Request, res: Response) => {
  const { username, password, did, verifiableCredential } = req.body
  const { credentialName } = req.params

  if (!verifiableCredential) {
    return res.status(400).send({ reason: failureReasons.verifiableCredentialMissing })
  } else if (!isVerifiableCredential(verifiableCredential)) {
    return res.status(422).send({ reason: failureReasons.verifiableCredentialInvalid })
  }

  // Construct a file path for the credential
  const credentialFile = `${userDirectory(username)}/${credentialName}.json`

  // Abort if credential file already exists
  if (fs.existsSync(credentialFile)) {
    return res.status(409).send({ reason: failureReasons.verifiableCredentialDuplicate })
  }

  const stronghold = await buildStronghold(username, password)
  if (!stronghold) {
    return res.status(401).send({ reason: failureReasons.passwordWrong })
  }

  const encryptedCredential = await encryptCredential(
    identity.DID.parse(did),
    JSON.stringify(verifiableCredential),
    stronghold
  )

  if (encryptedCredential === null) {
    return res.status(500).send({ reason: failureReasons.verifiableCredentialEncryptionFailed })
  }

  // Save the encryption data of the credential to a json file
  fs.writeFile(credentialFile, JSON.stringify(encryptedCredential.toJSON()), (err) => {
    if (err) {
      console.error(err)
      return res.status(500).send({ reason: failureReasons.diskWriteFailure })
    }
    return res.sendStatus(204)
  })
})

/** Get a Verifiable Credential by name. */
app.post(routes.credentialGet, authenticateJWT, async (req: Request, res: Response) => {
  const { username, password, did } = req.body
  const { credentialName } = req.params

  const stronghold = await buildStronghold(username, password)
  if (!stronghold) {
    return res.status(401).send({ reason: failureReasons.passwordWrong })
  }

  if (!credentialName) {
    return res.status(400).send(failureReasons.verifiableCredentialNameMissing)
  }

  // Construct a file path for the credential and abort if it does not exist
  const credentialFile = `${userDirectory(username)}/${credentialName}.json`
  if (!fs.existsSync(credentialFile)) {
    return res.status(404).send({ reason: failureReasons.verifiableCredentialNotFound })
  }

  // Read content of the credential file
  const fileContent = fs.readFileSync(credentialFile, { encoding: 'utf8' })

  const encryptedCredential = identity.EncryptedData.fromJSON(JSON.parse(fileContent))
  const credential = await decryptCredential(encryptedCredential, identity.DID.parse(did), stronghold)
  if (credential === null) {
    return res.status(500).send({ reason: failureReasons.verifiableCredentialDecryptionFailed })
  }

  return res.status(200).send(credential)
})

/** List all Verifiable Credentials of a user. */
app.get(routes.credentialList, authenticateJWT, async (req: Request, res: Response) => {
  const { username } = req.body
  const directory = userDirectory(username)

  fs.readdir(directory, (err, files) => {
    if (err) {
      return res.status(500).send({ reason: failureReasons.diskReadFailure })
    }

    const credentialFiles: string[] = []
    files.forEach((file) => {
      if (path.extname(file) === '.json') {
        credentialFiles.push(path.basename(file, '.json'))
      }
    })
    res.status(200).send({ credentials: credentialFiles })
  })
})

/** Create a Verifiable Presentation from a list of Verifiable Credentials. */
app.post(routes.presentationCreate, authenticateJWT, async (req: Request, res: Response) => {
  const { password, challenge, credentialNames, username, did } = req.body

  if (!password) {
    return res.status(400).send({ reason: failureReasons.passwordMissing })
  } else if (!challenge) {
    return res.status(400).send({ reason: failureReasons.challengeMissing })
  } else if (!(credentialNames && Array.isArray(credentialNames))) {
    return res.status(400).send({ reason: failureReasons.verifiableCredentialNameMissing })
  }

  const stronghold = await buildStronghold(username, password)
  if (!stronghold) {
    return res.status(401).send({ reason: failureReasons.passwordWrong })
  }

  const credentials: identity.Credential[] = []
  for (const credName of credentialNames) {
    // Construct a file path for the credential and abort if it does not exist
    const credentialFile = `${userDirectory(username)}/${credName}.json`
    if (!fs.existsSync(credentialFile)) {
      return res.status(404).send({ reason: failureReasons.verifiableCredentialNotFound })
    }

    // Read content of the credential file, decrypt it and add it to the list of credentials
    const fileContent = fs.readFileSync(credentialFile, { encoding: 'utf8' })
    const encryptedCredential = identity.EncryptedData.fromJSON(JSON.parse(fileContent))
    const credential = await decryptCredential(encryptedCredential, identity.DID.parse(did), stronghold)
    credentials.push(credential)
  }

  const account = await retrieveAccount(identity.DID.parse(did), stronghold)

  // Create the Verifiable Presentation
  const vp = new identity.Presentation({
    verifiableCredential: credentials,
    holder: did,
  })

  // Create a proof
  const proof = new identity.ProofOptions({
    challenge: challenge,
    // purpose: identity.ProofPurpose.authentication(), // TODO see https://www.w3.org/TR/did-core/#authentication
    expires: identity.Timestamp.nowUTC().checkedAdd(identity.Duration.minutes(keeperConfig.proofExpiryDuration)),
  })

  // Sign the presentation
  const signedVP = await account.createSignedPresentation(keeperConfig.arbitrarySigningKeyFragment, vp, proof)

  return res.status(200).send(signedVP.toJSON())
})

// Start the REST server
app.listen(apiPort, () => {
  console.log(`keeper listening at http://localhost:${apiPort}${apiBase}`)
})
