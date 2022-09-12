import { ApplicationError } from './ApplicationError'

export class ServerError extends ApplicationError {
  public httpCode: number
  public code: number
  public source: string

  constructor(message: string, httpCodeError?: number, codeError?: number, source?: string) {
    super(message)
    this.httpCode = httpCodeError || 500
    this.code = codeError || this.httpCode * 1000
    this.source = source || 'unknown'

    Object.setPrototypeOf(this, ServerError.prototype)
  }
}
