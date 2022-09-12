import joi from '@hapi/joi'

import { Language } from '../../../common/Language'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../../common/validators/Validator'
import { logger } from '../../../logger/LoggerFactory'
import { UserAuthForm } from '../models/UserAuthForm'

export class UserAuthFormValidator implements Validator<UserAuthForm> {
  private joiValidator = joi.object({
    username: joi
      .string()
      .email()
      .required(),

    password: joi
      .string()
      .max(128)
      .required(),

    language: joi
      .string()
      .valid(...Object.keys(Language))
      .optional(),

    enableEmailNotification: joi.boolean().optional(),

    deviceToken: joi.string().optional(),
  })

  validate(modelObject: UserAuthForm): ValidationResult {
    logger.debug('user-auth-form.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
