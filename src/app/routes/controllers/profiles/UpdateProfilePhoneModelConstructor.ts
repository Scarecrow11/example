import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { ConstructFrom } from '../../../generic/model/ConstructSingleFieldObject'
import { UpdateProfilePhone } from '../../../profiles/models/UpdateProfilePhone'

export class UpdateProfilePhoneModelConstructor
  implements ModelConstructor<UpdateProfilePhone, UpdateProfilePhone> {
  constructor(private usernameFrom: ConstructFrom = ConstructFrom.PARAMS) {}

  public constructRawForm(req: Request): UpdateProfilePhone {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): UpdateProfilePhone {
    const { phone, password } = req.body
    const { username } = req[this.usernameFrom]
    const { language } = req.query

    return {
      phone,
      password,
      username,
      language,
    }
  }
}
