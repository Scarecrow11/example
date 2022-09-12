export enum ConstructFrom {
  QUERY = 'query',
  PARAMS = 'params',
  BODY = 'body',
  USER = 'user',
}

export type SingleFieldObject = {
  [key: string]: string
}
