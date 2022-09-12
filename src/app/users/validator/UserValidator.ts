import joi from '@hapi/joi'

import { UserRole } from '../../common/UserRole'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { User } from '../models/User'
import { passwordValidator } from './PasswordValidator'

export class UserValidator implements Validator<User> {
  public joiValidator = joi.object({
    username: joi
      .string()
      .min(3)
      .required(),
    password: passwordValidator.required(),
    uid: joi.string().uuid(),
    role: joi
      .string()
      .valid(...[UserRole.JOURNALIST, UserRole.MODERATOR, UserRole.LEGAL])
      .required(),
    personUID: joi.string().uuid(),
  })

  validate(modelObject: User): ValidationResult {
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
