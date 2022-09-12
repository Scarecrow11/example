import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { UserAuthForm } from '../../../security/auth/models/UserAuthForm'

export class UserAuthFormModelConstructor implements ModelConstructor<UserAuthForm, UserAuthForm> {
  public constructRawForm(req: Request): UserAuthForm {
    const { username, password, enableEmailNotification, deviceToken } = req.body
    const { language } = req.query

    return { username, password, language, enableEmailNotification, deviceToken }
  }

  public constructPureObject(req: Request): UserAuthForm {
    return this.constructRawForm(req)
  }
}
