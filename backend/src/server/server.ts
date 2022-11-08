import config from '../config'
import express from 'express'
import apiRouter from './router/api'


const apiServer = express()
apiServer.disable('x-powered-by')
apiServer.use('/api', apiRouter)
apiServer.listen(config.apiPort, () => { console.log(`API listening on port ${config.apiPort}.`) })
