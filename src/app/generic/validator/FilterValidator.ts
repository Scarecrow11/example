import joi from '@hapi/joi'

import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { logger } from '../../logger/LoggerFactory'
import { EntityFilter } from '../model/EntityFilter'

export class FilterValidator implements Validator<EntityFilter> {
  private joiValidator = joi.object({
    limit: joi
      .number()
      .required()
      .min(1)
      .max(1000),
    offset: joi
      .number()
      .required()
      .min(0),
    order: joi
      .object({
        orderBy: joi.string().required(),
        asc: joi.boolean(),
      })
      .optional(),
  })

  validate(modelObject: EntityFilter): ValidationResult {
    logger.debug('filter.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
