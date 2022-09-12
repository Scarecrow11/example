import { container } from 'tsyringe'

import { logger } from '../../logger/LoggerFactory'
import { AuthDAOImpl } from './db/AuthDAOImpl'
import { AuthNotificationServiceImpl } from './services/AuthNotificationServiceImpl'
import { AuthProviderImpl } from './services/AuthProviderImpl'
import { AuthServiceImpl } from './services/AuthServiceImpl'

export class AuthModule {
  static async initialize(): Promise<void> {
    container.registerSingleton('AuthDAO', AuthDAOImpl)
    container.registerSingleton('AuthProvider', AuthProviderImpl)
    container.registerSingleton('AuthService', AuthServiceImpl)
    container.registerSingleton('AuthNotificationService', AuthNotificationServiceImpl)
    logger.debug('app.context.auth.module.initialized')
  }
}
