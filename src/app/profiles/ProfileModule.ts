import { container } from 'tsyringe'

import { logger } from '../logger/LoggerFactory'
import { ProfileDAOImpl } from './db/ProfileDAOImpl'
import { ProfileServiceImpl } from './services/ProfileServiceImpl'

export class ProfileModule {
  static async initialize(): Promise<void> {
    container.registerSingleton('ProfileDAO', ProfileDAOImpl)
    container.registerSingleton('ProfileService', ProfileServiceImpl)
    logger.debug('app.context.profile.module.initialized')
  }
}
