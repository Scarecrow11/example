import joi from '@hapi/joi'

import { UsernameUtility } from '../../common/UsernameUtility'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { ServerError } from '../../error/ServerError'
import { logger } from '../../logger/LoggerFactory'
import { passwordValidator } from '../../users/validator/PasswordValidator'
import { UpdateProfilePassword } from '../models/UpdateProfilePassword'

export class UpdateProfilePasswordValidator implements Validator<UpdateProfilePassword> {
  private joiValidator = joi.object({
    username: joi
      .string()
      .min(3)
      .required(),

    password: joi
      .string()
      .min(6)
      .max(64)
      .required(),

    newPassword: passwordValidator.required(),
  })

  validate(modelObject: UpdateProfilePassword): ValidationResult {
    logger.debug('profile.validate')
    if (UsernameUtility.isSocialUsernameType(modelObject.username)) {
      throw new ServerError('Invalid type of user account', 400)
    }
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
