import { container } from 'tsyringe'

import { logger } from '../logger/LoggerFactory'
import { DBConnection } from './DBConnection'

export class DBModule {
  static async initialize(): Promise<void> {
    const dbConnection = new DBConnection()

    container.register('DBConnection', {
      useValue: dbConnection.getConnection(),
    })
    logger.debug('app.context.database.module.initialized')
  }
}
