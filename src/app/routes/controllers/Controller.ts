import * as express from 'express'

export interface Controller {
  path(): string

  initialize(router: express.Router): void
}
