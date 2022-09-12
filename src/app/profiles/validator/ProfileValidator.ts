import joi from '@hapi/joi'

import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { logger } from '../../logger/LoggerFactory'
import { PersonValidator } from '../../person/validator/PersonValidator'
import { UserDetailsValidator } from '../../users/validator/UserDetailsValidator'
import { UserValidator } from '../../users/validator/UserValidator'
import { Profile } from '../models/Profile'

export class ProfileValidator implements Validator<Profile> {
  userValidator = new UserValidator()
  personValidator = new PersonValidator()
  detailsValidator = new UserDetailsValidator()

  private joiValidator = joi.object({
    user: this.userValidator.joiValidator,
    person: this.personValidator.joiValidator,
    details: this.detailsValidator.joiValidator,
  })

  validate(modelObject: Profile): ValidationResult {
    logger.debug('profile.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
