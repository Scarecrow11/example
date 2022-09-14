import joi from '@hapi/joi'

import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { logger } from '../../logger/LoggerFactory'
import { Person } from '../model/Person'

export class PersonValidator implements Validator<Person> {
  public joiValidator = joi.object({
    uid: joi
      .string()
      .uuid()
      .optional(),
    firstName: joi
      .string()
      .empty('')
      .max(255)
      .when('isLegalPerson', { is: true, then: joi.forbidden() }),
    middleName: joi
      .string()
      .empty('')
      .max(255)
      .when('isLegalPerson', { is: true, then: joi.forbidden() }),
    lastName: joi
      .string()
      .empty('')
      .max(255)
      .when('isLegalPerson', { is: true, then: joi.forbidden() }),
    email: joi
      .string()
      .email()
      .max(255)
      .empty(''),
    avatar: joi
      .string()
      .uuid()
      .optional(),
  })

  validate(modelObject: Person): ValidationResult {
    logger.debug('person.validate')

    const result = adaptValidationResult(this.joiValidator.validate(modelObject))

    return result
  }
}
