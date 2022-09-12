import { NextFunction, Request, Response } from 'express'

import { ApplicationError } from '../../error/ApplicationError'
import { AuthErrorCodes, ForbiddenErrorCodes } from '../../error/DetailErrorCodes'
import { ServerError } from '../../error/ServerError'
import { logger } from '../../logger/LoggerFactory'

export function finalErrorHandler(
  // NOTE: disable eslint because there's no interface for the type of error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof ServerError) {
    logger.debug('server.response.with-error:', error)
    if (
      (error.httpCode === 401 && error.code !== AuthErrorCodes.DONT_MATCH_ERROR) ||
      error.code === ForbiddenErrorCodes.USER_BANNED
    ) {
      response.clearCookie('token')
    }
    response
      .status(error.httpCode)
      .send({ message: error.message, source: error.source, code: error.code })
    return
  } else if (error instanceof ApplicationError) {
    logger.error('application.global.error:', error)
    response.status(500).send({ message: error.message, source: 'unknown', code: 500000 })
    return
  } else if (error instanceof Error) {
    logger.error('application.unexpected.error:', error)
  } else {
    logger.error('application.unexpected.thrown-object:', error)
  }
  response.status(500).send({ message: 'Unexpected server error', source: 'unknown', code: 500000 })
  next(error)
}
