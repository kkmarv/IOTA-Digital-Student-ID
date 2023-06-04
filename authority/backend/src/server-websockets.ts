import identity from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express from 'express'
import { Server as HTTPServer } from 'http'
import { Server as WSServer } from 'socket.io'
import authority from './authority.js'
import { API_BASE, API_PORT, WEBSOCKET_PORT } from './config.js'
import { randomString } from './helper.js'
import { ClientToServerEvents, ServerToClientEvents } from './socketIOTyping.js'

// Create API Server
const app = express()
app.disable('x-powered-by')
app.use(cors())
// authority.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));

// Create WebSocket Server
const httpServer = new HTTPServer(app)
const webSocket = new WSServer(httpServer, { cors: { origin: '*' } })
const clients = new Map<string, { challenge: string; authenticated: boolean }>()

/** Clean up stale sessions */
setInterval(() => {
  try {
    if (clients && clients.size > 20) {
      const keys = Array.from(clients.keys()).slice(0, 2)
      keys.forEach((did) => {
        clients.delete(did)
        console.log('Removed client', did)
      })
    }
  } catch (error) {
    console.error('cleanUpStaleSessions', error)
  }
}, 10 * 60 * 1000) // every 10 minutes

webSocket.use((socket, next) => {
  if (!socket.data?.did) {
    return next(new Error('Missing DID'))
  }

  return next()
})

webSocket.on('connection', (socket) => {
  console.log('A client connected')

  /** Register a client with their DID */
  socket.on('registerClient', (data, callback) => {
    if (!data || !data.did) {
      console.log('Registration: Client did not send their DID. Disconnecting client')
      socket.disconnect(true)
      return
    }

    const { did } = data
    console.log('Registration:', did)

    // Parse the DID
    try {
      identity.DID.parse(did)
    } catch (err) {
      console.log('Registration: Invalid DID! Disconnecting client')
      socket.disconnect(true)
      return
    }

    // Generate a random challenge and send it to the client
    const challenge = randomString(32)
    clients.set(did, { challenge: challenge, authenticated: false })
    socket.emit('authenticateClient', { challenge: challenge })
  })

  /** Authenticate a client with a signed challenge */
  socket.on('authenticateClient', async (data) => {
    if (!data || !data.signedData?.proof) {
      console.log('Authentication: Client did not send any data. Disconnecting client')
      socket.disconnect(true)
      return
    }

    const { signedData } = data
    const { challenge, verificationMethod } = signedData.proof
    const did = verificationMethod.split('#')[0]

    console.log('Authentication: Client', did)
    console.log(signedData.proof)

    // Check if the client is registered or already authenticated
    if (!clients.has(did)) {
      console.log('Authentication: Client not registered yet. Disconnecting client')
      socket.disconnect(true)
      return
    } else if (clients.get(did)?.authenticated) {
      return console.log('Authentication: Client already authenticated.')
    }

    const verifierOptions = new identity.VerifierOptions({
      challenge: challenge,
      allowExpired: false,
      // purpose: identity.ProofPurpose.authentication(), // TODO requires method relationship
    })

    // Create Tangle Resolver for the devnet
    const resolverBuilder = new identity.ResolverBuilder().clientConfig({ network: identity.Network.devnet() })
    const resolver = await resolverBuilder.build()

    // Resolve client's DID document and verify the challenge
    const clientDocument = (await resolver.resolve(did)).intoDocument()
    const isSignatureValid = clientDocument.verifyData(signedData, verifierOptions)

    if (!isSignatureValid) {
      console.log('Authentication: Failed. Disconnecting client')
      socket.disconnect(true)
      return
    }

    clients.set(did, { challenge: challenge, authenticated: true })
    socket.emit('authenticationConfirmation', { success: true })
    console.log('Authentication: Success')
  })

  /** Issue a credential to a client */
  socket.on('createCredential', async (data, callback) => {
    if (!data || !data.did) {
      return console.log('Credential: Client did not send their DID.')
    }

    const { did } = data
    console.log('Credential:', did)

    // Check if the client is authenticated
    if (!clients.get(did)?.authenticated) {
      console.log('Credential: Client not authenticated. Disconnecting client')
      socket.disconnect(true)
      return
    }

    // Parse the DID
    try {
      identity.DID.parse(did)
    } catch (err) {
      return console.log('Credential: Invalid DID!')
    }

    // TODO Validate the personal data of the client

    // Create a new credential
    const credentialSubject = { did: did } // TODO add clients personal data

    const studentCredential = new identity.Credential({
      credentialSubject: credentialSubject,
      issuer: authority.document().id(),
      type: 'MatriculationCredential',
    })

    const proofOptions = new identity.ProofOptions({
      purpose: identity.ProofPurpose.assertionMethod(),
      created: identity.Timestamp.nowUTC(),
      expires: undefined, // TODO
    })

    // Sign the credential
    const signedCredential = await authority.createSignedCredential('', studentCredential, proofOptions)

    console.dir('Credential: ' + signedCredential.toJSON(), { depth: null })
    socket.emit('createCredential', { credential: signedCredential.toJSON() })
  })

  socket.on('disconnect', () => {
    console.log('A client disconnected')
  })
})

webSocket.listen(WEBSOCKET_PORT)
console.log(`authority WebSocket listening at http://localhost:${WEBSOCKET_PORT}`)
app.listen(API_PORT, () => {
  console.log(`authority API listening at http://localhost:${API_PORT}${API_BASE}`)
})
