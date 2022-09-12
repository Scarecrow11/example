import { container } from 'tsyringe'

import { logger } from '../logger/LoggerFactory'
import { AuthController } from './controllers/auth/AuthController'
import { ImageController } from './controllers/media/image/ImageController'
import { ProfileController } from './controllers/profiles/ProfileController'

export class RouterModule {
  static async initialize(): Promise<void> {
    container.registerSingleton('AuthController', AuthController)
    container.registerSingleton('ProfileController', ProfileController)
    container.registerSingleton('ImageController', ImageController)

    logger.debug('app.context.router.module.initialized')
  }
}
