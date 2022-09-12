import { ValidationResult as JoiValidationResult } from 'hapi__joi'

import { ValidationErrorCodes } from '../../error/DetailErrorCodes'

const JoiToErrorMapper = (joiCode: string): number => {
  type MappingType = {
    [key: string]: number
  }

  const Mapping: MappingType = {
    'any.unknown': ValidationErrorCodes.FIELD_FORBIDDEN_VALIDATION_ERROR,
    'any.required': ValidationErrorCodes.FIELD_REQUIRED_VALIDATION_ERROR,
    'string.empty': ValidationErrorCodes.FIELD_REQUIRED_VALIDATION_ERROR,
    'any.only': ValidationErrorCodes.FIELD_VALUE_SHOULD_BE_IN_DICT_VALIDATION_ERROR,
    'string.max': ValidationErrorCodes.FIELD_LENGTH_MAX_VALIDATION_ERROR,
    'string.min': ValidationErrorCodes.FIELD_LENGTH_MIN_VALIDATION_ERROR,
    'date.max': ValidationErrorCodes.FIELD_DATA_MAX_VALIDATION_ERROR,
    'date.greater': ValidationErrorCodes.FIELD_DATA_MAX_VALIDATION_ERROR,
    'date.min': ValidationErrorCodes.FIELD_DATA_MIN_VALIDATION_ERROR,
    'date.format': ValidationErrorCodes.FIELD_VALUE_DOES_NOT_MATCH_THE_PATTERN,
    'string.email': ValidationErrorCodes.FIELD_VALUE_DOES_NOT_MATCH_THE_PATTERN,
    'number.max': ValidationErrorCodes.FIELD_NUMBER_MAX_VALIDATION_ERROR,
    'number.min': ValidationErrorCodes.FIELD_NUMBER_MIN_VALIDATION_ERROR,
    'string.base': ValidationErrorCodes.FIELD_DATA_TYPE_VALIDATION_ERROR,
    'number.base': ValidationErrorCodes.FIELD_DATA_TYPE_VALIDATION_ERROR,
    'boolean.base': ValidationErrorCodes.FIELD_DATA_TYPE_VALIDATION_ERROR,
    'string.guid': ValidationErrorCodes.FIELD_VALUE_DOES_NOT_MATCH_THE_PATTERN,
    'passwordComplexity.tooShort': ValidationErrorCodes.FIELD_LENGTH_MIN_VALIDATION_ERROR,
    'passwordComplexity.tooLong': ValidationErrorCodes.FIELD_LENGTH_MAX_VALIDATION_ERROR,
    'passwordComplexity.lowercase':
      ValidationErrorCodes.PASSWORD_LOWER_CASE_CHARACTER_VALIDATION_ERROR,
    'passwordComplexity.uppercase':
      ValidationErrorCodes.PASSWORD_UPPER_CASE_CHARACTER_VALIDATION_ERROR,
    'passwordComplexity.numeric': ValidationErrorCodes.PASSWORD_NUMERIC_CHARACTER_VALIDATION_ERROR,
    'passwordComplexity.symbol': ValidationErrorCodes.PASSWORD_SYMBOL_CHARACTER_VALIDATION_ERROR,
  }

  const resultCode = Mapping[joiCode]
  if (resultCode) {
    return resultCode
  }

  return ValidationErrorCodes.UNKNOWN_VALIDATION_ERROR
}

export interface ErrorDefinition {
  message: string
  source: string
  code: number
}

export interface ValidationResult {
  hasError: boolean
  errorDefinition: ErrorDefinition
}

export interface Validator<T> {
  validate(modelObject: T): ValidationResult
}

export const success: ValidationResult = {
  hasError: false,
  errorDefinition: { message: '', code: 0, source: '' },
}

// We don't care about joi validation result object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adaptValidationResult = (joiResult: JoiValidationResult<any>): ValidationResult => {
  if (joiResult.error) {
    const errorDetails = joiResult.error.details[0]
    const source = errorDetails.path.length !== 0 ? errorDetails.path.join('.') : 'validation'

    return {
      hasError: true,
      errorDefinition: {
        message: errorDetails.message,
        source,
        code: JoiToErrorMapper(errorDetails.type),
      },
    }
  }
  return success
}

export const validateionResultNoErrors: ValidationResult = {
  hasError: false,
  errorDefinition: {
    code: 0,
    message: ' ',
    source: '',
  },
}
