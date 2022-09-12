import joi from '@hapi/joi'

import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { logger } from '../../logger/LoggerFactory'
import { passwordValidator } from '../../users/validator/PasswordValidator'
import { SetNewPasswordForm } from '../models/SetNewPasswordForm'

export class SetNewPasswordFormValidator implements Validator<SetNewPasswordForm> {
  private joiValidator = joi.object({
    passwordRestorationCode: joi
      .string()
      .length(128)
      .required(),

    newPassword: passwordValidator.required(),
  })

  validate(modelObject: SetNewPasswordForm): ValidationResult {
    logger.debug('set-new-password-form.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
