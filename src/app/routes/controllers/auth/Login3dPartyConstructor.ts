import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { UserAuthForm } from '../../../security/auth/models/UserAuthForm'

export class Login3dPartyConstructor implements ModelConstructor<UserAuthForm, UserAuthForm> {
  public constructRawForm(req: Request): UserAuthForm {
    const { token, deviceToken } = req.body
    const { language } = req.query

    return { token, deviceToken, language }
  }

  public constructPureObject(req: Request): UserAuthForm {
    return this.constructRawForm(req)
  }
}
