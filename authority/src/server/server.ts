import cfg from '../config.js'
import express from 'express'
import apiRouter from './router/api/router.js'
import cors from 'cors'


const API_ENDPOINT = '/api'
const SERVER = express()

SERVER.disable('x-powered-by')
SERVER.use(cors())
SERVER.use(API_ENDPOINT, apiRouter)
SERVER.listen(cfg.apiPort, () => {
  console.log(`University listening at http://localhost:${cfg.apiPort}${API_ENDPOINT}`)
})