import { Request } from 'express'

export interface ModelConstructor<T, K> {
  constructRawForm(request: Request): T
  constructPureObject(request: Request): K
}
