import { Stronghold } from '@iota/identity-stronghold-nodejs'
import Identity from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express, { Request, Response } from 'express'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import {
  getStrongholdPath,
  getUserDirectory,
  isUserCredentials,
  isVerifiableCredential, UserCredentials
} from './helper'
import { authenticateJWT } from './jwt'
import path from 'path'

Identity.start()

const TOKEN_SECRET = 'youraccesstokensecret'


const PORT = 8081
const API_ENDPOINT = '/api'

const PATHS = {
  login: API_ENDPOINT + '/login',
  didGet: API_ENDPOINT + '/did/get',
  didCreate: API_ENDPOINT + '/did/create',
  credentialGet: API_ENDPOINT + '/credentials/get',
  credentialSave: API_ENDPOINT + '/credentials/save',
  credentialList: API_ENDPOINT + '/credentials/list',
}

const SERVER = express()
SERVER.disable('x-powered-by')
SERVER.use(cors({ origin: 'http://localhost:8080/' }))
SERVER.use(express.json())

const BASE_ACCOUNT_BUILDER_OPTIONS: Identity.AccountBuilderOptions = {
  autopublish: false,
  autosave: Identity.AutoSave.every(),
  clientConfig: { network: Identity.Network.devnet() }
}


SERVER.put(PATHS.didCreate, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).send('Invalid format.')
  }

  const credentials = req.body as UserCredentials
  const stronghold = await getStronghold(credentials.username, credentials.password, false)

  if (!stronghold) {
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


SERVER.post(PATHS.login, async (req: Request, res: Response) => {
  if (!isUserCredentials(req.body)) {
    return res.status(400).send('Invalid format.')
  }

  const credentials = req.body as UserCredentials
  const stronghold = await getStronghold(credentials.username, credentials.password)

  if (!stronghold) {
    return res.status(401).send('Wrong username or password.')
  }

  // Abort if Stronghold does not contain exactly one DID.
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).send('Corrupt Stronghold storage file.')
  }

  // Generate an access token
  const accessToken = jwt.sign(
    { username: credentials.username },
    TOKEN_SECRET,
    { expiresIn: '7d' } // TODO make shorter
  )

  return res.status(200).json({ jwt: accessToken })
})

/**
 * Create a Stronghold object.
 * 
 * @param username Name of the Stronghold file.
 * @param password Password of the Stronghold file.
 * @param strongholdShouldExist Wether the Stronghold should exist already or not.
 * @returns
 * - A Stronghold object on successful creation.
 * - Null if `password` is wrong or if `strongholdShouldExist` 
 * is set to true and the Stronghold file does not exist. 
 */
async function getStronghold(username: string, password: string, strongholdShouldExist = true): Promise<Stronghold | null> {
  const strongholdPath = getStrongholdPath(username)

  if (strongholdShouldExist && !fs.existsSync(strongholdPath)) {
    return null
  }

  // Build Stronghold storage file in /identities/<username>.hodl.
  // Building fails if file already exists but password is wrong.
  let stronghold: Stronghold
  try {
    stronghold = await Stronghold.build(strongholdPath, password)
  } catch (err) {
    console.error(err)
    return null
  }

  return stronghold
}


SERVER.post(PATHS.didGet, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.password) {
    return res.status(400).send('Missing password.')
  }

  const stronghold = await getStronghold(req.body.jwtPayload.username, req.body.password)

  if (!stronghold) {
    return res.status(401).send('Wrong username or password.')
  }

  // Abort if Stronghold does not contain exactly one DID.
  const didList = await stronghold.didList()
  if (didList.length != 1) {
    return res.status(500).send('Corrupt Stronghold storage file.')
  }

  return res.status(200).send({ did: didList[0] })
})


SERVER.put(PATHS.credentialSave, authenticateJWT, async (req: Request, res: Response) => {
  if (!req.body.verifiableCredential) {
    return res.status(400).send('Missing Verifiable Credential.')
  } else if (!isVerifiableCredential(req.body.verifiableCredential)) {
    return res.status(422).send('Not a Verifiable Credential.')
  }

  // Construct a file path for the credential.
  const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)}/${req.body.credentialName}.json`

  // Abort if credential file already exists.
  if (fs.existsSync(credentialFile)) {
    return res.status(409).send('Credential with same name already exists.')
  }

  const credential = JSON.stringify(req.body.verifiableCredential)

  // Save the credential to a json file.
  fs.writeFile(credentialFile, credential, (err) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error while saving credential.')
    }
    return res.sendStatus(204)
  })
})


SERVER.post(PATHS.credentialGet, authenticateJWT, async (req: Request, res: Response) => {
  const credentialFile = `${getUserDirectory(req.body.jwtPayload.username)}/${req.body.credentialName}.json`

  // Abort if credential does NOT exist.
  if (!fs.existsSync(credentialFile)) {
    return res.status(404).send('Credential with this name does not exist.')
  }

  // Read content of the credential file.
  fs.readFile(credentialFile, (err, data) => {
    if (err) {
      return res.status(500).send('Error while reading the credential file.')
    }
    const credential = JSON.parse(data.toString('utf8'))

    return res.status(200).json(credential)
  })
})


SERVER.get(PATHS.credentialList, authenticateJWT, async (req: Request, res: Response) => {
  const userDirectory = getUserDirectory(req.body.jwtPayload.username)

  fs.readdir(userDirectory, (err, files) => {
    if (err) {
      return res.status(500).send('Error while retrieving credentials.')
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


// Start the REST server.
SERVER.listen(PORT, () => {
  console.log(`Keeper listening at http://localhost:${PORT}${API_ENDPOINT}`)
})