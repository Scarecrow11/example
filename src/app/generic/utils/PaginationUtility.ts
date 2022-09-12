import { QueryBuilder } from 'knex'

import { ApplicationError } from '../../error/ApplicationError'
import { ValidationErrorCodes } from '../../error/DetailErrorCodes'
import { ServerError } from '../../error/ServerError'
import { logger } from '../../logger/LoggerFactory'
import { EntityFilter } from '../model/EntityFilter'
import { PaginationMetadata } from '../model/PaginationMetadata'

export class PaginationUtility {
  public static async totalCount(query: QueryBuilder, countColumn: string): Promise<number> {
    const entityCountResult: Record<string, number> | undefined = await query
      .clone()
      .count<Record<string, number>>(countColumn)
      .first()

    if (!entityCountResult) {
      logger.debug('pagination.calculate.error.query')
      throw new ApplicationError('Count query returned undefined. This should never really happen.')
    }

    return +entityCountResult.count
  }

  public static async calculatePaginationMetadata(
    queryBuilder: QueryBuilder,
    filter: EntityFilter,
    countColumn = 'uid',
  ): Promise<PaginationMetadata> {
    logger.debug('pagination.calculate.start')
    const { limit, offset } = filter

    const total = await this.totalCount(queryBuilder, countColumn)

    if (offset > total) {
      logger.debug('pagination.calculate.error.offset')
      throw new ServerError(
        'Offset bigger than total rows count',
        400,
        ValidationErrorCodes.FIELD_NUMBER_MAX_VALIDATION_ERROR,
        'pagination',
      )
    }
    logger.debug('pagination.calculate.done')

    return {
      limit,
      offset,
      total,
    }
  }

  public static applyPaginationForQuery(
    queryBuilder: QueryBuilder,
    filter: EntityFilter,
  ): QueryBuilder {
    logger.debug('pagination-utility.applyPaginationForQuery.start')
    const newQuery = queryBuilder
      .clone()
      .limit(filter.limit)
      .offset(filter.offset)

    if (filter.order) {
      newQuery.orderBy(filter.order.orderBy, filter.order.asc ? 'asc' : 'desc')
    }

    logger.debug('pagination-utility.applyPaginationForQuery.done')
    return newQuery
  }
}
