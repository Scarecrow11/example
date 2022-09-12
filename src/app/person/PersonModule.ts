import { container } from 'tsyringe'

import { logger } from '../logger/LoggerFactory'
import { PersonDAOImpl } from './db/PersonDAOImpl'
import { PersonServiceImpl } from './service/PersonServiceImpl'

export class PersonModule {
  static async initialize(): Promise<void> {
    container.registerSingleton('PersonDAO', PersonDAOImpl)
    container.registerSingleton('PersonService', PersonServiceImpl)
    logger.debug('app.context.person.module.initialized')
  }
}
