import cfg from '../config.js'
import express from 'express'
import apiRouter from './router/api/router.js'

const apiEndpoint = '/api'
const server = express()

server.disable('x-powered-by')
server.use(apiEndpoint, apiRouter)
server.listen(cfg.apiPort, () => {
  console.log(`API listening at ${apiEndpoint} on port ${cfg.apiPort}.`)
})