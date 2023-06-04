import identity from '@iota/identity-wasm/node/identity_wasm.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { API_BASE, FAILURE_REASONS, API_PORT, ROUTES } from './config.js'
import {
  UserCredentials,
  buildStronghold,
  getUserDirectory,
  isUserCredentials,
  isVerifiableCredential,
} from './helper.js'
import { authenticateJWT, issueJWT } from './jwt.js'

identity.start()

/** Default options for the AccountBuilder. */
const accBuilderBaseOptions: identity.AccountBuilderOptions = {
  autopublish: false,
  autosave: identity.AutoSave.every(),
  clientConfig: { network: identity.Network.devnet() },
}

const corsOptions: cors.CorsOptions = {
  origin: `http://localhost:5173`, // Vite dev server
  allowedHeaders: ['Content-Type'],
  credentials: true,
}

// WebServer setup
const app = express()
app.disable('x-powered-by')
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json()) // TODO look into nicer options
// TODO look into using helmet

/** Create a JWT cookie. */
app.post(ROUTES.authTokenCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).json({ reason: FAILURE_REASONS.credentialsMissing })
  }

  const { username, password } = req.body
  const stronghold = await buildStronghold(username, password)

  if (!stronghold) {
    return res.status(401).json({ reason: FAILURE_REASONS.credentialsWrong })
  }

  // Abort if Stronghold does not contain exactly one DID
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).json({ reason: FAILURE_REASONS.didDuplicate })
  }

  // Create JWT and set a cookie
  const accessToken = issueJWT(username, didList[0].toString())
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: true,
  })

  return res.sendStatus(204)
})

/** Verify a JWT cookie. */
app.get(ROUTES.authTokenVerify, authenticateJWT, async (req: Request, res: Response) => {
  res.sendStatus(204)
})

/** Delete a JWT cookie. */
app.get(ROUTES.authTokenDelete, authenticateJWT, async (req: Request, res: Response) => {
  res.clearCookie('accessToken').sendStatus(204)
})

/** Create a DID from a username and password. */
app.put(ROUTES.didCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).json({ reason: FAILURE_REASONS.credentialsMissing })
  }

  const { username, password } = req.body as UserCredentials
  const stronghold = await buildStronghold(username, password, false)

  if (!stronghold) {
    return res.status(409).json({ reason: FAILURE_REASONS.userDuplicate })
  }

  // Abort if Stronghold already contains a DID
  // Means that this exact user has registered already
  const didList = await stronghold.didList()
  if (didList.length != 0) {
    return res.status(409).json({ reason: FAILURE_REASONS.userDuplicate })
  }

  const builder = new identity.AccountBuilder({
    autopublish: accBuilderBaseOptions.autopublish,
    autosave: accBuilderBaseOptions.autosave,
    clientConfig: accBuilderBaseOptions.clientConfig,
    storage: stronghold,
  })

  const account = await builder.createIdentity()

  // Publish the DID document to the Tangle
  // Fails if client cannot connect establish a connection
  try {
    await account.publish()
  } catch (err) {
    console.error(err)
    return res.status(503).json({ reason: FAILURE_REASONS.tangleNoConnection })
  }

  console.dir(account.document().toJSON(), { depth: null })

  return res.sendStatus(204)
})

/** Get a DID from a username and password. */
app.post(ROUTES.didGet, authenticateJWT, async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!password) {
    return res.status(400).json({ reason: FAILURE_REASONS.passwordMissing })
  }

  const stronghold = await buildStronghold(username, password)

  if (!stronghold) {
    return res.status(403).json({ reason: FAILURE_REASONS.passwordWrong })
  }

  // Abort if Stronghold does not contain exactly one DID
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).json({ reason: FAILURE_REASONS.didDuplicate })
  }

  return res.status(200).json({ did: didList[0] })
})

/** Sign a challenge. */
app.post(ROUTES.didSign, authenticateJWT, async (req: Request, res: Response) => {
  const { username, password, did, data, challenge } = req.body

  if (!password) {
    return res.status(400).json({ reason: FAILURE_REASONS.passwordMissing })
  }

  const stronghold = await buildStronghold(username, password)
  if (!stronghold) {
    return res.status(401).json({ reason: FAILURE_REASONS.passwordWrong })
  }

  const builder = new identity.AccountBuilder({
    autopublish: accBuilderBaseOptions.autopublish,
    autosave: accBuilderBaseOptions.autosave,
    clientConfig: accBuilderBaseOptions.clientConfig,
    storage: stronghold,
  })

  const proof = new identity.ProofOptions({
    challenge: challenge,
    purpose: identity.ProofPurpose.authentication(),
    expires: identity.Timestamp.nowUTC().checkedAdd(identity.Duration.minutes(10)),
  })

  const account = await builder.loadIdentity(identity.DID.parse(did))
  const signedData = await account.createSignedData('sign-0', { data }, proof)
  console.log(signedData)

  return res.status(200).json({ signedData: signedData })
})

/** Store a Verifiable Credential. */
app.put(ROUTES.credentialStore, authenticateJWT, async (req: Request, res: Response) => {
  const { username, credentialName, verifiableCredential } = req.body

  if (!verifiableCredential) {
    return res.status(400).json({ reason: FAILURE_REASONS.verifiableCredentialMissing })
  } else if (!isVerifiableCredential(verifiableCredential)) {
    return res.status(422).json({ reason: FAILURE_REASONS.verifiableCredentialInvalid })
  }

  // Construct a file path for the credential
  const credentialFile = `${getUserDirectory(username)}/${credentialName}.json`

  // Abort if credential file already exists
  if (fs.existsSync(credentialFile)) {
    return res.status(409).json({ reason: FAILURE_REASONS.verifiableCredentialDuplicate })
  }

  const credential = JSON.stringify(verifiableCredential)

  // Save the credential to a json file
  fs.writeFile(credentialFile, credential, (err) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ reason: FAILURE_REASONS.diskWriteFailure })
    }
    return res.sendStatus(204)
  })
})

/** Get a Verifiable Credential by name. */
app.get(ROUTES.credentialGet, authenticateJWT, async (req: Request, res: Response) => {
  const { username } = req.body
  const { credentialName } = req.params

  if (!credentialName) {
    return res.status(400).json(FAILURE_REASONS.verifiableCredentialNameMissing)
  }

  const credentialFile = `${getUserDirectory(username)}/${credentialName}.json`

  console.log(credentialFile)

  // Abort if credential does NOT exist
  if (!fs.existsSync(credentialFile)) {
    return res.status(404).json({ reason: FAILURE_REASONS.verifiableCredentialNameWrong })
  }

  // Read content of the credential file
  fs.readFile(credentialFile, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      return res.status(500).json({ reason: FAILURE_REASONS.diskReadFailure })
    }

    const credential = JSON.parse(data)
    return res.status(200).json(credential)
  })
})

/** List all Verifiable Credentials of a user. */
app.get(ROUTES.credentialList, authenticateJWT, async (req: Request, res: Response) => {
  const { username } = req.body
  const userDirectory = getUserDirectory(username)

  fs.readdir(userDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ reason: FAILURE_REASONS.diskReadFailure })
    }

    const credentialFiles: string[] = []
    files.forEach((file) => {
      if (path.extname(file) === '.json') {
        credentialFiles.push(path.basename(file, '.json'))
      }
    })
    res.status(200).json({ credentials: credentialFiles })
  })
})

/** Create a Verifiable Presentation from a list of Verifiable Credentials. */
app.post(ROUTES.presentationCreate, authenticateJWT, async (req: Request, res: Response) => {
  const { username, password, did, challenge, credentialNames } = req.body

  if (!password) {
    return res.status(400).json({ reason: FAILURE_REASONS.passwordMissing })
  } else if (!challenge) {
    return res.status(400).json({ reason: FAILURE_REASONS.challengeMissing })
  } else if (!(credentialNames && Array.isArray(credentialNames))) {
    return res.status(400).json({ reason: FAILURE_REASONS.verifiableCredentialNameMissing })
  }

  const stronghold = await buildStronghold(username, password)
  if (!stronghold) {
    return res.status(401).json({ reason: FAILURE_REASONS.passwordWrong })
  }

  const credentials: identity.Credential[] = []
  for (const credName of credentialNames) {
    const credentialFile = `${getUserDirectory(username)}/${credName}.json`

    // Abort if credential does NOT exist
    if (!fs.existsSync(credentialFile)) {
      return res.status(404).json({ reason: FAILURE_REASONS.verifiableCredentialNameWrong })
    }

    // Read content of the credential file and convert it to a Credential object
    const credentialData = fs.readFileSync(credentialFile, { encoding: 'utf8' })
    credentials.push(identity.Credential.fromJSON(JSON.parse(credentialData)))
  }

  const builder = new identity.AccountBuilder({
    autopublish: accBuilderBaseOptions.autopublish,
    autosave: accBuilderBaseOptions.autosave,
    clientConfig: accBuilderBaseOptions.clientConfig,
    storage: stronghold,
  })

  const account = await builder.loadIdentity(did)

  // Create the Verifiable Presentation
  const vp = new identity.Presentation({
    verifiableCredential: credentials,
    holder: did,
  })

  // Create a proof
  const proof = new identity.ProofOptions({
    challenge: challenge,
    expires: identity.Timestamp.nowUTC().checkedAdd(identity.Duration.minutes(10)),
  })

  // Sign the presentation
  const signedVP = await account.createSignedPresentation('sign-0', vp, proof)

  return res.status(200).json(signedVP.toJSON())
})

// Start the REST server
app.listen(API_PORT, () => {
  console.log(`keeper listening at http://localhost:${API_PORT}${API_BASE}`)
})
