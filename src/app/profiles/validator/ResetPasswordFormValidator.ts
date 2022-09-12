import joi from '@hapi/joi'

import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { SingleFieldObject } from '../../generic/model/ConstructSingleFieldObject'
import { logger } from '../../logger/LoggerFactory'

export class ResetPasswordFormValidator implements Validator<SingleFieldObject> {
  private joiValidator = joi.object({
    email: joi
      .string()
      .email()
      .required(),
  })

  validate(modelObject: SingleFieldObject): ValidationResult {
    logger.debug('reset-password-form.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
