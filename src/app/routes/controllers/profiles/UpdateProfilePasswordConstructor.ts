import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { ConstructFrom } from '../../../generic/model/ConstructSingleFieldObject'
import { UpdateProfilePassword } from '../../../profiles/models/UpdateProfilePassword'

export class UpdateProfilePasswordModelConstructor
  implements ModelConstructor<UpdateProfilePassword, UpdateProfilePassword> {
  constructor(private usernameFrom: ConstructFrom) {}
  public constructRawForm(req: Request): UpdateProfilePassword {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): UpdateProfilePassword {
    const { newPassword, password } = req.body
    const { username } = req[this.usernameFrom]

    return {
      username,
      password,
      newPassword,
    }
  }
}
