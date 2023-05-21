import identity, { VerifierOptions } from '@iota/identity-wasm/node/identity_wasm.js'
import cors from 'cors'
import express from 'express'
import { Server as HTTPServer } from 'http'
import { Socket, Server as WSServer } from 'socket.io'
import cfg from './config.js'
import { API_ENDPOINT } from './constants.js'
import { AuthenticationResponse, HelloResponse, randomString } from './helper.js'

const authority = express()
authority.disable('x-powered-by')
authority.use(cors())
// authority.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));

const httpServer = new HTTPServer(authority)
const wsServer = new WSServer(httpServer, { cors: { origin: '*' } })

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

wsServer.on('connection', (socket: Socket) => {
  console.log('A client connected')

  socket.on('registerClient', (data: HelloResponse | null) => {
    if (data === null) return console.log('Did not send any data')

    const { did } = data
    console.log('Registering client:', did)

    // Parse the DID
    try {
      identity.DID.parse(did)
    } catch (err) {
      return console.log('Invalid DID!')
    }

    const challenge = randomString(32)
    clients.set(did, challenge)

    socket.emit('authRequest', { challenge: challenge })
  })

  socket.on('authRequest', async (data: AuthenticationResponse) => {
    const { challenge, verificationMethod } = data.signedData.proof
    const did = verificationMethod.split('#')[0]

    console.log('Authenticating client:', did)
    console.log(data.signedData.proof)
    clients.get(did) === challenge ? console.log('Challenge match') : console.log('Challenge mismatch')

    const verifierOptions = new VerifierOptions({
      challenge: challenge,
      allowExpired: false,
      // purpose: identity.ProofPurpose.authentication(), // TODO
    })

    // Create Tangle Resolver for the devnet
    const resolverBuilder = new identity.ResolverBuilder().clientConfig({ network: identity.Network.devnet() })
    const resolver = await resolverBuilder.build()

    // Resolve client's DID document and verify the challenge
    const clientDocument = (await resolver.resolve(did)).intoDocument()
    const isSignatureValid = clientDocument.verifyData(data.signedData, verifierOptions)

    if (!isSignatureValid) {
      return console.log('Authentication failure')
    }

    console.log('Authentication success')
  })

  socket.on('message', (message: string) => {
    console.log('Received message:', message)
    socket.emit('message', 'Server received your message: ' + message)
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
