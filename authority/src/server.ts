import cors from 'cors'
import express from 'express'
import { Server as HTTPServer } from 'http'
import { Socket, Server as WSServer } from 'socket.io'
import cfg from './config.js'
import { API_ENDPOINT } from './constants.js'
import { randomString } from './helper.js'

const authority = express()
authority.disable('x-powered-by')
authority.use(cors())
// authority.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));

const httpServer = new HTTPServer(authority)
const wsServer = new WSServer(httpServer, { cors: { origin: '*' } })

wsServer.on('connection', (socket: Socket) => {
  console.log('A client connected')
  socket.emit('auth', { challenge: randomString(32) })

  socket.on('auth', (data: any) => {})

  socket.on('message', (message: string) => {
    console.log('Received message:', message)
    socket.emit('message', 'Server received your message: ' + message)
  })

  socket.on('disconnect', () => {
    console.log('A client disconnected')
  })
})

wsServer.listen(3000)
authority.listen(cfg.apiPort, () => {
  console.log(`authority listening at http://localhost:${cfg.apiPort}${API_ENDPOINT}`)
})
