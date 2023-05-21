import identity, { VerifierOptions } from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express from 'express'
import { Server as HTTPServer } from 'http'
import { Socket, Server as WSServer } from 'socket.io'
import cfg from './config.js'
import { API_ENDPOINT } from './constants.js'
import { randomString } from './helper.js'
import { ClientToServerEvents, ServerToClientEvents } from './socketIOTyping.js'

const authority = express()
authority.disable('x-powered-by')
authority.use(cors())
// authority.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));
identity.VerifierOptions
const httpServer = new HTTPServer(authority)
const wsServer = new WSServer<ClientToServerEvents, ServerToClientEvents>(httpServer, { cors: { origin: '*' } })

const clients = new Map<string, string>()

setInterval(() => {
  try {
    if (clients && clients.size > 20) {
      const keys = Array.from(clients.keys()).slice(0, 2)
      keys.forEach((k) => {
        clients.delete(k)
        console.log('Removed client', k)
      })
    }
  } catch (error) {
    console.error('cleanUpStaleSessions', error)
  }
}, 10 * 60 * 1000) // every 10 minutes

wsServer.on('connection', (socket) => {
  console.log('A client connected')

  socket.on('registerClient', (data) => {
    if (data === null) {
      socket.disconnect(true)
      return console.log('Did not send any data. Disconnecting client')
    }

    const { did } = data
    console.log('Registering client:', did)

    // Parse the DID
    try {
      identity.DID.parse(did)
    } catch (err) {
      socket.disconnect(true)
      return console.log('Invalid DID! Disconnecting client')
    }

    const challenge = randomString(32)
    clients.set(did, challenge)

    socket.emit('authRequest', { challenge: challenge })
  })

  socket.on('authRequest', async (data) => {
    const { challenge, verificationMethod } = data.signedData.proof
    const did = verificationMethod.split('#')[0]

    console.log('Authenticating client:', did)
    console.log(data.signedData.proof)
    clients.get(did) === challenge ? console.log('Challenge match') : console.log('Challenge mismatch')

    const verifierOptions = new VerifierOptions({
      challenge: challenge,
      allowExpired: false,
      // purpose: identity.ProofPurpose.authentication(), // TODO requires method relationship
    })

    // Create Tangle Resolver for the devnet
    const resolverBuilder = new identity.ResolverBuilder().clientConfig({ network: identity.Network.devnet() })
    const resolver = await resolverBuilder.build()

    // Resolve client's DID document and verify the challenge
    const clientDocument = (await resolver.resolve(did)).intoDocument()
    const isSignatureValid = clientDocument.verifyData(data.signedData, verifierOptions)

    if (!isSignatureValid) {
      socket.disconnect(true)
      return console.log('Authentication failure. Disconnecting client')
    }

    console.log('Authentication success')
  })

  socket.on('disconnect', () => {
    console.log('A client disconnected')
  })
})

const wsPort = 3000
wsServer.listen(wsPort)
console.log(`authority WebSocket listening at http://localhost:${wsPort}`)
authority.listen(cfg.apiPort, () => {
  console.log(`authority API listening at http://localhost:${cfg.apiPort}${API_ENDPOINT}`)
})
