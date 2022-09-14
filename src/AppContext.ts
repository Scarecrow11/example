import { DBModule } from './app/db/DBModule'
import { logger } from './app/logger/LoggerFactory'
import { LoggerModule } from './app/logger/LoggerModule'
import { ImageModule } from './app/media/image/ImageModule'
import { ProfileModule } from './app/profiles/ProfileModule'
import { RouterModule } from './app/routes/RouterModule'
import { AuthModule } from './app/security/auth/AuthModule'
import { UserModule } from './app/users/UserModule'
import {PersonModule} from "./app/person/PersonModule";

export class AppContext {
  static async initialize(): Promise<void> {
    await LoggerModule.initialize()
    await DBModule.initialize()
    await AuthModule.initialize()
    await UserModule.initialize()
    await ImageModule.initialize()
    await PersonModule.initialize()
    await RouterModule.initialize()
    await ProfileModule.initialize()

    logger.info('app.context.initialized')
  }
}
