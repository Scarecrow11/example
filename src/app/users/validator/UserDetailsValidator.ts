import joi from '@hapi/joi'

import { Language } from '../../common/Language'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { UserDetails } from '../models/UserDetails'

export class UserDetailsValidator implements Validator<UserDetails> {
  public joiValidator = joi.object({
    notifyEmail: joi.boolean(),
    language: joi.string().valid(...Object.values(Language)),
  })

  validate(modelObject: UserDetails): ValidationResult {
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
