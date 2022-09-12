export interface ACS {
  readonly hasAccess: boolean
  readonly fullAccess: boolean
  toSQL: (uidName?: string) => {}
  toArray: () => Array<string> | string
}
