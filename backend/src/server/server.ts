import cfg from '../config.js'
import express from 'express'
import apiRouter from './router/api.js'

const apiEndpoint = '/api'
const apiServer = express()
apiServer.disable('x-powered-by')
apiServer.use(apiEndpoint, apiRouter)
apiServer.listen(cfg.apiPort, () => {
  console.log(`API listening at ${apiEndpoint} on port ${cfg.apiPort}.`)
})