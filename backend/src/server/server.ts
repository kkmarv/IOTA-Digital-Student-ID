import cfg from '../config.js'
import express from 'express'
import apiRouter from './router/api.js'


const apiServer = express()
apiServer.disable('x-powered-by')
apiServer.use('/api', apiRouter)
apiServer.listen(cfg.apiPort, () => { console.log(`API listening on port ${cfg.apiPort}.`) })