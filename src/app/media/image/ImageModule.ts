import { container } from 'tsyringe'

import { logger } from '../../logger/LoggerFactory'
import { ImageStorageDaoImpl } from './db/ImageStorageDaoImpl'
import { ImageStorageImpl } from './service/ImageStorageImpl'

export class ImageModule {
  static async initialize(): Promise<void> {
    container.registerSingleton('ImageStorageDao', ImageStorageDaoImpl)
    container.registerSingleton('ImageStorage', ImageStorageImpl)
    logger.debug('app.context.image.module.initialized')
  }
}
