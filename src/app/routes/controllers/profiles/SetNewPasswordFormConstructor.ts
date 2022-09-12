import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { SetNewPasswordForm } from '../../../profiles/models/SetNewPasswordForm'

export class SetNewPasswordFormModelConstructor
  implements ModelConstructor<SetNewPasswordForm, SetNewPasswordForm> {
  public constructRawForm(req: Request): SetNewPasswordForm {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): SetNewPasswordForm {
    const { newPassword, passwordRestorationCode } = req.body

    return {
      newPassword,
      passwordRestorationCode,
    }
  }
}
