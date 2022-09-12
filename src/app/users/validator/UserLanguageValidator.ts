import joi from '@hapi/joi'

import { Language } from '../../common/Language'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'

export class UserLanguageValidator implements Validator<{ language: string }> {
  public joiValidator = joi.object({
    language: joi
      .string()
      .valid(...Object.values(Language))
      .required(),
  })

  validate(modelObject: { language: string }): ValidationResult {
    return adaptValidationResult(this.joiValidator.validate(modelObject))
  }
}
