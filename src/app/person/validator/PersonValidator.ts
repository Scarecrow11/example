import joi from '@hapi/joi'

import { Gender } from '../../common/Gender'
import { DateUtility } from '../../common/utils/DateUtility'
import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { logger } from '../../logger/LoggerFactory'
import { Person } from '../model/Person'
import { PhoneValidator } from './PhoneValidator'

export class PersonValidator implements Validator<Person> {
  phoneValidate = new PhoneValidator()
  public joiValidator = joi.object({
    uid: joi
      .string()
      .uuid()
      .optional(),
    isLegalPerson: joi.boolean().required(),
    isPublicPerson: joi
      .boolean()
      .when('isLegalPerson', { is: true, then: joi.required().valid(true) }),
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
    jobTitle: joi
      .string()
      .empty('')
      .max(255)
      .when('isLegalPerson', { is: true, then: joi.forbidden() }),
    legalName: joi
      .string()
      .max(255)
      .when('isLegalPerson', { is: false, then: joi.forbidden() })
      .when('isLegalPerson', { is: true, then: joi.required() }),
    shortName: joi
      .string()
      .max(255)
      .when('isLegalPerson', { is: false, then: joi.forbidden() })
      .when('isLegalPerson', { is: true, then: joi.required() }),
    tagline: joi
      .string()
      .empty('')
      .max(1024)
      .when('isLegalPerson', { is: false, then: joi.forbidden() }),
    email: joi
      .string()
      .email()
      .max(255)
      .empty(''),
    phone: joi
      .string()
      .max(19)
      .min(13)
      .when('isLegalPerson', { is: true, then: joi.required() }),
    birthdayAt: joi
      .date()
      .iso()
      .min(new Date('01.01.1900 GMT+00:00'))
      .max(DateUtility.now()),
    gender: joi
      .string()
      .when('isLegalPerson', {
        is: false,
        then: joi.string().valid(...Object.values(Gender)),
      })
      .when('isLegalPerson', { is: true, then: joi.forbidden() }),
    bio: joi.string().empty(''),
    addressDistrict: joi.string().empty(''),
    addressTown: joi.string().empty(''),
    avatar: joi
      .string()
      .uuid()
      .optional(),
  })

  validate(modelObject: Person): ValidationResult {
    logger.debug('person.validate')

    const result = adaptValidationResult(this.joiValidator.validate(modelObject))

    if (!result.hasError && modelObject.phone) {
      const phoneNumberError = this.phoneValidate.validate({ phone: modelObject.phone })

      if (phoneNumberError.hasError) {
        return phoneNumberError
      }
    }
    return result
  }
}
