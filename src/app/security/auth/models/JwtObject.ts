export interface JwtObject {
  [data: string]: any // eslint-disable-line
  iat: number
  exp?: number
}
