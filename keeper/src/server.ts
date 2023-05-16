import Identity from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express, { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import {
  buildStronghold,
  getUserDirectory,
  isJsonWebToken,
  isUserCredentials,
  isVerifiableCredential, UserCredentials
} from './helper.js'
import { authenticateJWT, issueJWT } from './jwt.js'

Identity.start()

const PORT = 8081
const API_ROOT = '/api'

const ROUTES = {
  didGet: API_ROOT + '/did/get',
  didCreate: API_ROOT + '/did/create',
  authTokenCreate: API_ROOT + '/auth/create',
  authTokenVerify: API_ROOT + '/auth/verify',
  authTokenDelete: API_ROOT + '/auth/delete',
  credentialGet: API_ROOT + '/credentials/get/:name',
  credentialStore: API_ROOT + '/credentials/store',
  credentialList: API_ROOT + '/credentials/list',
  presentationCreate: API_ROOT + '/presentations/create'
}

const SERVER = express()
SERVER.disable('x-powered-by')
SERVER.use(cors())
SERVER.use(express.json())

const BASE_ACCOUNT_BUILDER_OPTIONS: Identity.AccountBuilderOptions = {
  autopublish: false,
  autosave: Identity.AutoSave.every(),
  clientConfig: { network: Identity.Network.devnet() }
}


SERVER.put(ROUTES.didCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).json('Invalid format of JSON request.')
  }

  const credentials = req.body as UserCredentials
  const stronghold = await buildStronghold(credentials.username, credentials.password, false)

  if (!stronghold) {
    return res.status(409).json('Username already taken.')
  }

  // Abort if Stronghold already contains a DID
  // Means that this exact user has registered already
  const didList = await stronghold.didList()
  if (didList.length != 0) {
    return res.status(409).json('Username already taken.')
  }

  const builder = new Identity.AccountBuilder({
    autopublish: BASE_ACCOUNT_BUILDER_OPTIONS.autopublish,
    autosave: BASE_ACCOUNT_BUILDER_OPTIONS.autosave,
    clientConfig: BASE_ACCOUNT_BUILDER_OPTIONS.clientConfig,
    storage: stronghold
  })

  const account = await builder.createIdentity()

  // Publish the DID document to the Tangle
  // Fails if client cannot connect establish a connection
  try {
    await account.publish()
  } catch (err) {
    console.error(err)
    return res.status(503).json(`Error while publishing the DID. ${account.document().id()} `)
  }

  console.dir(account.document().toJSON(), { depth: null })

  return res.sendStatus(204)
})


SERVER.post(ROUTES.authTokenCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).json('Missing username or password.')
  }

  const credentials = req.body as UserCredentials
  const stronghold = await buildStronghold(credentials.username, credentials.password)

  stronghold?.flushChanges

  if (!stronghold) {
    return res.status(401).json('Wrong username or password.')
  }

  // Abort if Stronghold does not contain exactly one DID
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).json('Corrupted Stronghold storage file.')
  }

  const accessToken = issueJWT(credentials.username)

  return res.status(200).json({ jwt: accessToken })
})


SERVER.get(ROUTES.authTokenVerify, authenticateJWT, async (req: Request, res: Response) => {
  res.sendStatus(204)
})


SERVER.get(ROUTES.authTokenDelete, authenticateJWT, async (req: Request, res: Response) => {
  // TODO
})


SERVER.post(ROUTES.didGet, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.password) {
    return res.status(400).json('Missing password.')
  }

  const stronghold = await buildStronghold(req.body.jwtPayload.username, req.body.password)

  if (!stronghold) {
    return res.status(403).json('Wrong password.')
  }

  // Abort if Stronghold does not contain exactly one DID
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).json('Corrupted Stronghold storage file.')
  }

  return res.status(200).json({ did: didList[0] })
})


SERVER.put(ROUTES.credentialStore, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.verifiableCredential) {
    return res.status(400).json('Missing Verifiable Credential.')
  } else if (!isVerifiableCredential(req.body.verifiableCredential)) {
    return res.status(422).json('Not a Verifiable Credential.')
  }

  // Construct a file path for the credential
  const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)} /${req.body.credentialName}.json`

  // Abort if credential file already exists
  if (fs.existsSync(credentialFile)) {
    return res.status(409).json('Credential with same name already exists.')
  }

  const credential = JSON.stringify(req.body.verifiableCredential)

  // Save the credential to a json file
  fs.writeFile(credentialFile, credential, (err) => {
    if (err) {
      console.error(err)
      return res.status(500).json('Error while saving credential.')
    }
    return res.sendStatus(204)
  })
})


SERVER.get(ROUTES.credentialGet, authenticateJWT, async (req: Request, res: Response) => {
  const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)}/${req.params.name}.json`

  console.log(credentialFile);


  // Abort if credential does NOT exist
  if (!fs.existsSync(credentialFile)) {
    return res.status(404).json('Credential with this name does not exist.')
  }

  // Read content of the credential file
  fs.readFile(credentialFile, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      return res.status(500).json('Error while reading the credential file.')
    }
    const credential = JSON.parse(data)

    return res.status(200).json(credential)
  })
})


SERVER.get(ROUTES.credentialList, authenticateJWT, async (req: Request, res: Response) => {
  const userDirectory = getUserDirectory(req.body.jwtPayload.username)

  fs.readdir(userDirectory, (err, files) => {
    if (err) {
      return res.status(500).json('Error while retrieving credentials.')
    }

    const credentialFiles: string[] = []

    files.forEach(file => {
      if (path.extname(file) === '.json') {
        credentialFiles.push(path.basename(file, '.json'))
      }
    })

    res.status(200).json({ credentials: credentialFiles })
  })
})


SERVER.post(ROUTES.presentationCreate, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.password) {
    return res.status(400).json('Missing password.')
  } else if (!req.body.challenge) {
    return res.status(400).json('Missing challenge.')
  } else if (!(req.body.credentialNames && Array.isArray(req.body.credentialNames))) {
    return res.status(400).json('Missing credential name.')
  }

  const stronghold = await buildStronghold(req.body.jwtPayload.username, req.body.password)

  if (!stronghold) {
    return res.status(401).json('Wrong username or password.')
  }

  let credentials: Identity.Credential[] = []
  await Promise.all(req.body.credentialNames.map(async (credentialName: string) => {
    const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)}/${req.body.credentialName}.json`

    console.log(credentialName);

    // Abort if credential does NOT exist
    if (!fs.existsSync(credentialFile)) {
      return res.status(404).json(`Credential with name ${credentialName} does not exist.`)
    }

    // Read content of the credential file and convert it to a Credential object
    const credentialData = fs.readFileSync(credentialFile, { encoding: 'utf8' })
    credentials.push(Identity.Credential.fromJSON(JSON.parse(credentialData)))
  }))

  const builder = new Identity.AccountBuilder({
    autopublish: BASE_ACCOUNT_BUILDER_OPTIONS.autopublish,
    autosave: BASE_ACCOUNT_BUILDER_OPTIONS.autosave,
    clientConfig: BASE_ACCOUNT_BUILDER_OPTIONS.clientConfig,
    storage: stronghold
  })

  // Retrieve DID from Stronghold
  const did = (await stronghold.didList())[0]
  const account = await builder.loadIdentity(did)

  // Create the Verifiable Presentation
  const vp = new Identity.Presentation({
    verifiableCredential: credentials,
    holder: did
  })

  // Create a proof
  const proof = new Identity.ProofOptions({
    challenge: req.body.challenge,
    expires: Identity.Timestamp.nowUTC().checkedAdd(Identity.Duration.minutes(10))
  })

  // Sign the presentation.
  const signedVP = await account.createSignedPresentation("sign-0", vp, proof)

  return res.status(200).json(signedVP.toJSON())
})


// Start the REST server.
SERVER.listen(PORT, () => {
  console.log(`Keeper listening at http://localhost:${PORT}${API_ROOT}`)
})