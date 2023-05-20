import Identity from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import {
  UserCredentials,
  buildStronghold,
  getUserDirectory,
  isUserCredentials,
  isVerifiableCredential,
} from './helper.js'
import { authenticateJWT, issueJWT } from './jwt.js'

Identity.start()

const keeper = express()
keeper.disable('x-powered-by')
keeper.use(cors())
keeper.use(express.json())

const accBuilderBaseOptions: Identity.AccountBuilderOptions = {
  autopublish: false,
  autosave: Identity.AutoSave.every(),
  clientConfig: { network: Identity.Network.devnet() },
}

keeper.put(ROUTES.didCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).json({ reason: FAILURE_REASONS.credentialsMissing })
  }

  const credentials = req.body as UserCredentials
  const stronghold = await buildStronghold(credentials.username, credentials.password, false)

  if (!stronghold) {
    return res.status(409).json({ reason: FAILURE_REASONS.userDuplicate })
  }

  // Abort if Stronghold already contains a DID
  // Means that this exact user has registered already
  const didList = await stronghold.didList()
  if (didList.length != 0) {
    return res.status(409).json({ reason: FAILURE_REASONS.userDuplicate })
  }

  const builder = new Identity.AccountBuilder({
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

keeper.post(ROUTES.authTokenCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).json({ reason: FAILURE_REASONS.credentialsMissing })
  }

  const credentials = req.body as UserCredentials
  const stronghold = await buildStronghold(credentials.username, credentials.password)

  stronghold?.flushChanges

  if (!stronghold) {
    return res.status(401).json({ reason: FAILURE_REASONS.credentialsWrong })
  }

  // Abort if Stronghold does not contain exactly one DID
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).json({ reason: FAILURE_REASONS.didDuplicate })
  }

  const accessToken = issueJWT(credentials.username)

  return res.status(200).json({ jwt: accessToken })
})

keeper.get(ROUTES.authTokenVerify, authenticateJWT, async (req: Request, res: Response) => {
  res.sendStatus(204)
})

keeper.post(ROUTES.didGet, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.password) {
    return res.status(400).json({ reason: FAILURE_REASONS.passwordMissing })
  }

  const stronghold = await buildStronghold(req.body.jwtPayload.username, req.body.password)

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

keeper.put(ROUTES.credentialStore, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.verifiableCredential) {
    return res.status(400).json({ reason: FAILURE_REASONS.verifiableCredentialMissing })
  } else if (!isVerifiableCredential(req.body.verifiableCredential)) {
    return res.status(422).json({ reason: FAILURE_REASONS.verifiableCredentialInvalid })
  }

  // Construct a file path for the credential
  const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)} /${req.body.credentialName}.json`

  // Abort if credential file already exists
  if (fs.existsSync(credentialFile)) {
    return res.status(409).json({ reason: FAILURE_REASONS.verifiableCredentialDuplicate })
  }

  const credential = JSON.stringify(req.body.verifiableCredential)

  // Save the credential to a json file
  fs.writeFile(credentialFile, credential, (err) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ reason: FAILURE_REASONS.diskWriteFailure })
    }
    return res.sendStatus(204)
  })
})

keeper.get(ROUTES.credentialGet, authenticateJWT, async (req: Request, res: Response) => {
  const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)}/${req.params.name}.json`

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

keeper.get(ROUTES.credentialList, authenticateJWT, async (req: Request, res: Response) => {
  const userDirectory = getUserDirectory(req.body.jwtPayload.username)

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

keeper.post(ROUTES.presentationCreate, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.password) {
    return res.status(400).json({ reason: FAILURE_REASONS.passwordMissing })
  } else if (!req.body.challenge) {
    return res.status(400).json({ reason: FAILURE_REASONS.challengeMissing })
  } else if (!(req.body.credentialNames && Array.isArray(req.body.credentialNames))) {
    return res.status(400).json({ reason: FAILURE_REASONS.verifiableCredentialNameMissing })
  }

  const stronghold = await buildStronghold(req.body.jwtPayload.username, req.body.password)

  if (!stronghold) {
    return res.status(401).json({ reason: FAILURE_REASONS.credentialsMissing })
  }

  let credentials: Identity.Credential[] = []
  await Promise.all(
    req.body.credentialNames.map(async (credentialName: string) => {
      const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)}/${req.body.credentialName}.json`

      console.log(credentialName)

      // Abort if credential does NOT exist
      if (!fs.existsSync(credentialFile)) {
        return res.status(404).json({ reason: FAILURE_REASONS.verifiableCredentialNameWrong })
      }

      // Read content of the credential file and convert it to a Credential object
      const credentialData = fs.readFileSync(credentialFile, { encoding: 'utf8' })
      credentials.push(Identity.Credential.fromJSON(JSON.parse(credentialData)))
    })
  )

  const builder = new Identity.AccountBuilder({
    autopublish: accBuilderBaseOptions.autopublish,
    autosave: accBuilderBaseOptions.autosave,
    clientConfig: accBuilderBaseOptions.clientConfig,
    storage: stronghold,
  })

  // Retrieve DID from Stronghold
  const did = (await stronghold.didList())[0]
  const account = await builder.loadIdentity(did)

  // Create the Verifiable Presentation
  const vp = new Identity.Presentation({
    verifiableCredential: credentials,
    holder: did,
  })

  // Create a proof
  const proof = new Identity.ProofOptions({
    challenge: req.body.challenge,
    expires: Identity.Timestamp.nowUTC().checkedAdd(Identity.Duration.minutes(10)),
  })

  // Sign the presentation
  const signedVP = await account.createSignedPresentation('sign-0', vp, proof)

  return res.status(200).json(signedVP.toJSON())
})

// Start the REST server
keeper.listen(PORT, () => {
  console.log(`Keeper listening at http://localhost:${PORT}${API_ROOT}`)
})
