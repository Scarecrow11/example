import knex, * as Knex from 'knex'

import { config } from '../../../config/knexConfig'
import { EnvironmentMode } from '../common/EnvironmentMode'
import { logger } from '../logger/LoggerFactory'

export class DBConnection {
  private readonly knexConnection: Knex
  private readonly NO_DB_CONNECTION_ERROR_CODE = -501

  constructor() {
    const preparedConfig =
      config[EnvironmentMode.getSimpleName() as 'test' | 'development' | 'production']

    preparedConfig.log = {
      warn(message: string): void {
        logger.warn(message)
      },
      error(message: string): void {
        logger.error(message)
      },
      deprecate(message: string): void {
        logger.info(message)
      },
      debug(message: string): void {
        logger.debug(message)
      },
    }

    this.knexConnection = knex(preparedConfig)

    this.pingDB()

    this.knexConnection.on('query', data => {
      logger.silly(JSON.stringify(data))
    })
  }

  private async pingDB(): Promise<void> {
    try {
      await this.knexConnection.raw('select 1+1 as result')
    } catch (err) {
      logger.error('Error while connect to db:', err)
      process.exit(this.NO_DB_CONNECTION_ERROR_CODE)
    }
  }

  public getConnection(): Knex {
    return this.knexConnection
  }
}
