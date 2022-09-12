import { ComplexityOptions } from 'joi-password-complexity'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const passwordComplexity = require('joi-password-complexity')

const complexityPasswordOptions: ComplexityOptions = {
  min: 8,
  max: 128,
  lowerCase: 0,
  upperCase: 0,
  numeric: 0,
  symbol: 0,
  requirementCount: 0,
}

export const passwordValidator = passwordComplexity(complexityPasswordOptions)
