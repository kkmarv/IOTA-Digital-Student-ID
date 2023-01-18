import { Stronghold } from '@iota/identity-stronghold-nodejs'
import Identity from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express, { Request, Response } from 'express'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { getStrongholdPath, getUserDirectory, isUserCredentials, isVerifiableCredential, UserCredentials } from './helper'
import { authenticateJWT } from './jwt'

const TOKEN_SECRET = 'youraccesstokensecret'


const PORT = 8081
const API_ENDPOINT = '/api'

const LOGIN_PATH = API_ENDPOINT + '/login'
const REGISTER_PATH = API_ENDPOINT + '/register'

const SERVER = express()
SERVER.disable('x-powered-by')
SERVER.use(cors({ origin: 'http://localhost:8080' }))
SERVER.use(express.json())

const BASE_ACCOUNT_BUILDER_OPTIONS: Identity.AccountBuilderOptions = {
  autopublish: false,
  autosave: Identity.AutoSave.every(),
  clientConfig: { network: Identity.Network.devnet() }
}


SERVER.put(REGISTER_PATH, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).send('Invalid format.')
  }

  const credentials = req.body as UserCredentials

  // Build Stronghold storage file in /identities/<username>.hodl.
  // Building fails if file already exists but password is wrong.
  let stronghold
  try {
    stronghold = await Stronghold.build(
      getStrongholdPath(credentials.username),
      credentials.password
    )
  } catch (err) {
    console.error(err)
    return res.status(409).send('Username already taken.')
  }

  // Abort if Stronghold Already contains a DID.
  // Means that this exact user has registered already.
  const didList = await stronghold.didList()
  if (didList.length != 0) {
    return res.status(409).send('Username already taken.')
  }

  const builder = new Identity.AccountBuilder({
    autopublish: BASE_ACCOUNT_BUILDER_OPTIONS.autopublish,
    autosave: BASE_ACCOUNT_BUILDER_OPTIONS.autosave,
    clientConfig: BASE_ACCOUNT_BUILDER_OPTIONS.clientConfig,
    storage: stronghold
  })

  const account = await builder.createIdentity()

  // Publish the DID document to the Tangle.
  // Fails if client cannot connect establish a connection.
  try {
    await account.publish()
  } catch (err) {
    console.error(err)
    return res.status(503).send({ message: 'Error while publishing the DID.', did: account.document().id() })
  }

  console.dir(account.document().toJSON(), { depth: null })

  return res.sendStatus(204)
})


SERVER.post(LOGIN_PATH, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).send('Invalid format.')
  }

  const credentials = req.body as UserCredentials
  const strongholdPath = getStrongholdPath(credentials.username)

  // If Stronghold storage file does not exist, the user does not exist.
  if (!fs.existsSync(strongholdPath)) {
    return res.status(401).send('Wrong username or password.')
  }

  // Build Stronghold storage file in /identities/<username>.hodl.
  // Building fails if file already exists but password is wrong.
  let stronghold
  try {
    stronghold = await Stronghold.build(strongholdPath, credentials.password)
  } catch (err) {
    console.error(err)
    return res.status(401).send('Wrong username or password.')
  }

  // Abort if Stronghold does not contain exactly one DID.
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).send('Corrupt Stronghold storage file.')
  }

  // Generate an access token
  const accessToken = jwt.sign(
    { name: credentials.username, password: credentials.password },
    TOKEN_SECRET,
    { expiresIn: '7d' } // TODO make shorter
  )

  return res.status(200).json({ jwt: accessToken })
})

// TODO remove query parameters and move credentials into jwt
SERVER.get(API_ENDPOINT + '/getdid/:username/:password', authenticateJWT, async (req: Request, res: Response) => {
  // Build Stronghold storage file in /identities/<username>.hodl.
  // Building fails if file already exists but password is wrong.
  let stronghold: Stronghold
  try {
    stronghold = await Stronghold.build(
      getStrongholdPath(req.params.username),
      req.params.password
    )
  } catch (err) {
    console.error(err)
    return res.status(401).send('Wrong username or password.')
  }

  // Abort if Stronghold does not contain exactly one DID.
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).send('Corrupt Stronghold storage file.')
  }

  return res.status(200).send({ did: didList[0] })
})


SERVER.put(API_ENDPOINT + '/credentials/save', authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.verifiableCredential) {
    return res.status(400).send('Missing Verifiable Credential.')
  } else if (!isVerifiableCredential(req.body.verifiableCredential)) {
    return res.status(400).send('Not a Verifiable Credential.')
  }

  // Construct a file name for the credential.
  const credentialFile = `${getUserDirectory(req.body.user.name)}/${req.body.credentialName}.json`

  // Abort if credential file already exists.
  if (fs.existsSync(credentialFile)) {
    return res.status(400).send('Credential with same name already exists.')
  }

  const credential = JSON.stringify(req.body.verifiableCredential)

  // Save the credential to a json file.
  fs.writeFile(credentialFile, credential, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error while saving credential.')
    }
    return res.sendStatus(204)
  })
})


// Start the REST server.
SERVER.listen(PORT, () => {
  console.log(`API listening at ${API_ENDPOINT} on port ${PORT}.`)
})