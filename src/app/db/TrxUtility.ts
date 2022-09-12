import * as Knex from 'knex'

import { ApplicationError } from '../error/ApplicationError'
import { ServerError } from '../error/ServerError'
import { logger } from '../logger/LoggerFactory'
import { errorCodes } from './PSQLErrors'
import { TrxProvider } from './TrxProvider'

export class TrxUtility {
  public static async transactional<T>(
    db: Knex,
    daoQuery: (trxProvider: TrxProvider) => Promise<T>,
  ): Promise<T> {
    const trxProvider = db.transactionProvider()

    const trx = await trxProvider()
    logger.debug('database.query.trx.started')
    try {
      const result = await daoQuery(trxProvider)
      logger.debug('database.query.executed')
      await trx.commit()
      logger.debug('database.query.trx.committed')
      return result
    } catch (err) {
      logger.debug('database.query.trx.error:', err)
      await trx.rollback()
      logger.debug('database.query.trx.rolled-back')

      const error = errorCodes.find(e => e.code === err.code)
      if (error) {
        throw new ServerError(
          error.message,
          error.resCode,
          error.detailCode,
          error.sourceExtractor(err),
        )
      }

      if (err instanceof ServerError) {
        throw err
      }

      if (err instanceof ApplicationError) {
        throw err
      }

      throw new ApplicationError(err.message)
    }
  }

  private constructor() {
    // NOTE: utility constructor
  }
}
