import joi from '@hapi/joi'

import { logger } from '../../logger/LoggerFactory'
import { adaptValidationResult, ValidationResult } from './Validator'

export class UUIDValidator {
  private fieldName: string

  private joiValidator: joi.ObjectSchema

  constructor(fieldName = 'uid') {
    this.fieldName = fieldName

    this.joiValidator = joi.object({
      [this.fieldName]: joi
        .string()
        .uuid()
        .required(),
    })
  }

  validate<T>(entity: T): ValidationResult {
    logger.debug('uuid.validate')
    return adaptValidationResult(this.joiValidator.validate(entity))
  }
}
