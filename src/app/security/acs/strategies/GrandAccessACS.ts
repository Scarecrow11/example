import { ACS } from '../models/ACS'

export class GrandAccessACS implements ACS {
  public hasAccess = true
  public fullAccess = true

  toSQL(): {} {
    return {}
  }

  toArray(): Array<string> {
    return ['*']
  }
}
