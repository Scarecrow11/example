import { container } from 'tsyringe'

import { logger } from '../logger/LoggerFactory'
import { UserDAOImpl } from './db/UserDAOImpl'
import { UserDetailsDAOImpl } from './db/UserDetailsDAOImpl'
import { UserDetailsServiceImpl } from './services/UserDetailsServiceImpl'
import { UserServiceImpl } from './services/UserServiceImpl'

export class UserModule {
  static async initialize(): Promise<void> {
    container.registerSingleton('UserDAO', UserDAOImpl)
    container.registerSingleton('UserService', UserServiceImpl)
    container.registerSingleton('UserDetailsDAO', UserDetailsDAOImpl)
    container.registerSingleton('UserDetailsService', UserDetailsServiceImpl)
    logger.debug('app.context.user.module.initialized')
  }
}
