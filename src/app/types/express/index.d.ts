/*eslint-disable */

declare namespace Express {
  interface User {
    [_: string]: any
  }
  interface Request {
    accessRules?: any
    user?: User
  }
}

/*eslint-enable */
