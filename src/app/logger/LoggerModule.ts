import { logger } from './LoggerFactory'

export class LoggerModule {
  static async initialize(): Promise<void> {
    process.on('uncaughtException', error => {
      logger.error('server.uncaught.error:', error)
    })
    process.on('unhandledRejection', error => {
      logger.error('server.unhandled-promise.error:', error)
    })
    logger.debug('app.context.logger.module.initialized')
  }
}
