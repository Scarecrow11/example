import { NotFoundErrorCodes } from '../../error/DetailErrorCodes'
import { ServerError } from '../../error/ServerError'
import { logger } from '../../logger/LoggerFactory'

export const checkDAOResult = (result: number, entity: string, func: string): void => {
  if (result === 0) {
    logger.debug(`${entity}.dao.${func}.not-found`)
    throw new ServerError(
      `Not found [${entity}] entity for ${func}`,
      404,
      NotFoundErrorCodes.ENTITY_NOT_FOUND_ERROR,
      entity,
    )
  } else if (result !== 1) {
    logger.debug(`${entity}.dao.${func}.error`)
    throw new ServerError(
      `${func} for entity [${entity}] failed`,
      400,
      NotFoundErrorCodes.TOO_MANY_RECORDS_ERROR,
      entity,
    )
  }
}
