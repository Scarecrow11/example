const startTime = new Date().getMilliseconds()

import 'reflect-metadata'
import 'dotenv/config'

import http from 'http'

import { App } from './App'
import { AppContext } from './AppContext'
import { logger } from './app/logger/LoggerFactory'

const port = process.env.SERVER_PORT || 3000

AppContext.initialize()
  .then(() => {
    const server = http.createServer(new App().application)
    server.listen(port, () => {
      const serverStartMs = new Date().getMilliseconds() - startTime
      logger.info(`server.start.successful.on:${port}.in${serverStartMs}ms`)
    })
  })
  .catch(error => {
    logger.error('server.start.error:', error)
    process.exit(-1)
  })
