import { NextFunction, Request, Response } from 'express'

import { logger } from '../../logger/LoggerFactory'
import { ModelConstructor } from '../ModelConstructor'
import { Validator } from './Validator'

export const validate = <T, K>(
  modelConstructor: ModelConstructor<T, K>,
  validator: Validator<T>,
) => (request: Request, response: Response, next: NextFunction): void => {
  logger.debug('common.validation-provider-factory.setup.for:', {
    message: modelConstructor.constructor.name,
  })

  logger.debug('common.validation.by:', { message: validator.constructor.name })
  const error = validator.validate(modelConstructor.constructRawForm(request))

  if (error.hasError) {
    const { code, message, source } = error.errorDefinition
    logger.debug('common.validation.failed:', error.errorDefinition)
    response.status(400).json({ message, source, code })
  } else {
    logger.debug('common.validation.done')
    next()
  }
}
