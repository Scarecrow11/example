import joi from '@hapi/joi'

import { Language } from '../../common/Language'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { logger } from '../../logger/LoggerFactory'
import { UpdateProfilePhone } from '../models/UpdateProfilePhone'

export class UpdateProfilePhoneValidator implements Validator<UpdateProfilePhone> {
  private joiValidator = joi.object({
    phone: joi.string().required(),
    username: joi
      .string()
      .min(3)
      .required(),

    password: joi
      .string()
      .min(8)
      .max(30)
      .optional(),

    language: joi
      .string()
      .valid(...Object.keys(Language))
      .optional(),
  })

  validate(modelObject: UpdateProfilePhone): ValidationResult {
    logger.debug('profile-phone.validate')
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
