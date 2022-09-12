import { ACS } from '../models/ACS'

export class AccessDeniedACS implements ACS {
  public hasAccess = false
  public fullAccess = false

  toSQL(): {} {
    return {}
  }

  toArray(): [] {
    return []
  }
}
