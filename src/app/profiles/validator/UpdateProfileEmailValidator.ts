import joi from '@hapi/joi'

import { Language } from '../../common/Language'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { logger } from '../../logger/LoggerFactory'
import { UpdateProfileEmail } from '../models/UpdateProfileEmail'

export class UpdateProfileEmailValidator implements Validator<UpdateProfileEmail> {
  private joiValidator = joi.object({
    email: joi
      .string()
      .email()
      .required(),

    username: joi
      .string()
      .min(3)
      .required(),

    password: joi
      .string()
      .min(8)
      .max(30)
      .required(),

    language: joi
      .string()
      .valid(...Object.keys(Language))
      .optional(),
  })

  validate(modelObject: UpdateProfileEmail): ValidationResult {
    logger.debug('profile-email.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
