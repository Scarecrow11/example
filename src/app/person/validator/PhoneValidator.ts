import joi from '@hapi/joi'

import {
  adaptValidationResult,
  ValidationResult,
  Validator,
} from '../../common/validators/Validator'
import { ValidationErrorCodes } from '../../error/DetailErrorCodes'
import { SingleFieldObject } from '../../generic/model/ConstructSingleFieldObject'
import { logger } from '../../logger/LoggerFactory'

export class PhoneValidator implements Validator<SingleFieldObject> {
  private phoneValidator = joi.object({
    phone: joi
      .string()
      .max(19)
      .min(13)
      .required(),
  })

  private containsNumbersOnly(str: string): boolean {
    return str.split('').every(c => '0123456789'.includes(c))
  }

  private validatePhoneBodyParts(mainBlock: string, ext?: string): string | undefined {
    if (!this.containsNumbersOnly(mainBlock)) {
      return 'Phone number main part should consist of numbers only'
    }

    if (ext && !this.containsNumbersOnly(ext)) {
      return 'Phone number extension part should consist of numbers only'
    }
  }

  private validateWithoutExt(value: string): string | undefined {
    if (value.length >= 14) {
      return 'Phone number without extension should have length less or equal to 13'
    } else {
      return this.validatePhoneBodyParts(value.substr(4, 9))
    }
  }

  private validateWithExt(value: string, extensionStart: number): string | undefined {
    const ext = value.substr(extensionStart, value.length - extensionStart)
    if (ext.length === 0) {
      return 'Phone extension length must be at least 1 character long'
    } else {
      return this.validatePhoneBodyParts(
        value.substr(4, 9),
        value.substr(extensionStart, value.length - extensionStart),
      )
    }
  }

  private validatePhone(value?: string): string | undefined {
    if (value) {
      const extensionStart = value.indexOf('#')

      if (!value.startsWith('+380')) {
        return 'Phone number should start with +380 and consist of numbers and optional extension'
      } else {
        if (extensionStart === -1) {
          return this.validateWithoutExt(value)
        } else if (extensionStart === 13) {
          return this.validateWithExt(value, extensionStart + 1)
        } else {
          return 'Phone number extension should start on 13 character'
        }
      }
    }
  }

  validate(modelObject: SingleFieldObject): ValidationResult {
    logger.debug('phone.validate')
    const result = adaptValidationResult(this.phoneValidator.validate(modelObject))

    if (!result.hasError) {
      const phoneNumberError = this.validatePhone(modelObject.phone)
      if (phoneNumberError) {
        return {
          hasError: true,
          errorDefinition: {
            source: 'phone',
            code: ValidationErrorCodes.FIELD_VALUE_DOES_NOT_MATCH_THE_PATTERN,
            message: phoneNumberError,
          },
        }
      }
    }
    return result
  }
}
