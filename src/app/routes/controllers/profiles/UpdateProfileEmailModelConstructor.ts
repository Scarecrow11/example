import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { ConstructFrom } from '../../../generic/model/ConstructSingleFieldObject'
import { UpdateProfileEmail } from '../../../profiles/models/UpdateProfileEmail'

export class UpdateProfileEmailModelConstructor
  implements ModelConstructor<UpdateProfileEmail, UpdateProfileEmail> {
  constructor(private usernameFrom: ConstructFrom = ConstructFrom.PARAMS) {}

  public constructRawForm(req: Request): UpdateProfileEmail {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): UpdateProfileEmail {
    const { email, password } = req.body
    const { username } = req[this.usernameFrom]
    const { language } = req.query

    return {
      email,
      password,
      username,
      language,
    }
  }
}
