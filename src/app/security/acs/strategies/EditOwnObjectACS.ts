import { ACS } from '../models/ACS'

export class EditOwnObjectACS implements ACS {
  private readonly userId: string
  public hasAccess = true
  public fullAccess = false

  constructor(userId: string) {
    this.userId = userId
  }

  toSQL(uidName?: string): {} {
    return {
      [uidName as string]: this.userId,
    }
  }

  toArray(): Array<string> {
    return [this.userId]
  }
}
