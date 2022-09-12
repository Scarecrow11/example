import { ErrorCodes } from './ErrorCodes'

export class ApplicationError extends Error {
  public errorCode: ErrorCodes | number = 500

  constructor(message: string, errorCode?: ErrorCodes | number) {
    super(message)

    if (errorCode) {
      this.errorCode = errorCode
    }

    Object.setPrototypeOf(this, ApplicationError.prototype)
  }
}
