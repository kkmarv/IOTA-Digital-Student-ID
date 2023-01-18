import cfg from '../config.js'
import express from 'express'
import apiRouter from './router/api/router.js'
import cors from 'cors'


const apiEndpoint = '/api'
const server = express()

server.disable('x-powered-by')
server.use(cors())
server.use(apiEndpoint, apiRouter)
server.listen(cfg.apiPort, () => {
  console.log(`University listening at ${apiEndpoint} on port ${cfg.apiPort}.`)
})