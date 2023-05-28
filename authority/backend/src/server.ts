import identity from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express from 'express'
import { Server as HTTPServer } from 'http'
import { Server as WSServer } from 'socket.io'
import { apiBase, apiPort, webSocketPort } from './config.js'
import { randomString } from './helper.js'
import { ClientToServerEvents, ServerToClientEvents } from './socketIOTyping.js'
import { log } from 'console'

// Create API Server
const app = express()
app.disable('x-powered-by')
app.use(cors())
// authority.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));

// Create WebSocket Server
const httpServer = new HTTPServer(app)
const webSocket = new WSServer<ClientToServerEvents, ServerToClientEvents>(httpServer, { cors: { origin: '*' } })
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

webSocket.on('connection', (socket) => {
  console.log('A client connected')

  socket.on('registerClient', (data) => {
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

  socket.on('authenticateClient', async (signedChallenge) => {
    if (!signedChallenge || !signedChallenge.signedData?.proof) {
      log('Authentication: Client did not send any data. Disconnecting client')
      socket.disconnect(true)
      return
    }

    const { signedData } = signedChallenge
    const { challenge, verificationMethod } = signedData.proof
    const did = verificationMethod.split('#')[0]

    console.log('Authentication: Client', did)
    console.log(signedData.proof)

    if (!clients.has(did)) {
      console.log('Authentication: Client not registered yet. Disconnecting client')
      socket.disconnect(true)
      return
    } else if (clients.get(did)?.authenticated) {
      console.log('Authentication: Client already authenticated.')
      return
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
    console.log('Authentication: Success')
  })

  socket.on('disconnect', () => {
    console.log('A client disconnected')
  })
})

webSocket.listen(webSocketPort)
console.log(`authority WebSocket listening at http://localhost:${webSocketPort}`)
app.listen(apiPort, () => {
  console.log(`authority API listening at http://localhost:${apiPort}${apiBase}`)
})
