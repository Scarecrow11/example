import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { UserDetails } from '../../../users/models/UserDetails'

export class UserDetailsModelConstructor implements ModelConstructor<UserDetails, UserDetails> {
  public constructRawForm(req: Request): UserDetails {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): UserDetails {
    const {
      language,
    } = req.body

    return {
      language,
    }
  }
}
