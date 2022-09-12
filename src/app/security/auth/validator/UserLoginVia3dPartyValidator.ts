import joi from '@hapi/joi'

import { Language } from '../../../common/Language'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../../common/validators/Validator'
import { logger } from '../../../logger/LoggerFactory'
import { UserAuthForm } from '../models/UserAuthForm'

export class UserLoginVia3dPartyValidator implements Validator<UserAuthForm> {
  private joiValidator = joi.object({
    token: joi.string().required(),

    language: joi
      .string()
      .valid(...Object.keys(Language))
      .optional(),

    deviceToken: joi.string().optional(),
  })

  validate(modelObject: UserAuthForm): ValidationResult {
    logger.debug('user-login-form.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
