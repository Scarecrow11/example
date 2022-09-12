import joi from '@hapi/joi'

import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { SingleFieldObject } from '../../generic/model/ConstructSingleFieldObject'

export class PhoneCodeValidator implements Validator<SingleFieldObject> {
  private joiValidator = joi
    .number()
    .min(100000)
    .max(999999)

  validate(modelObject: SingleFieldObject): ValidationResult {
    return adaptValidationResult(this.joiValidator.validate(+modelObject.phoneConfirmationCode))
  }
}
