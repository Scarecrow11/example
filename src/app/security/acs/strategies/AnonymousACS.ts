import { UserRole } from '../../../common/UserRole'
import { ACS } from '../models/ACS'

export class AnonymousACS implements ACS {
  private readonly userId: string = UserRole.ANONYMOUS
  public hasAccess = true
  public fullAccess = false

  toSQL(uidName?: string): {} {
    return {
      [uidName as string]: this.userId,
    }
  }

  toArray(): Array<string> {
    return [this.userId]
  }
}
