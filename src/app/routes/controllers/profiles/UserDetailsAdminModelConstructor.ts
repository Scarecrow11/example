import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { UserRole } from '../../../common/UserRole'
import { UserDetails } from '../../../users/models/UserDetails'

export class UserDetailsAdminModelConstructor
  implements ModelConstructor<UserDetails, UserDetails> {
  public constructRawForm(req: Request): UserDetails {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): UserDetails {
    const {
      enableEmailNotification,
      notifySMS,
      notifyTelegram,
      notifyViber,
      notifyAboutNewPoll,
      linkFacebook,
      linkGoogle,
      linkSite,
      wpJournalistID,
      role,
    } = req.body

    return {
      notifyEmail: enableEmailNotification ?? true,
      notifySMS,
      notifyTelegram,
      notifyViber,
      notifyAboutNewPoll,
      linkFacebook,
      linkGoogle,
      linkSite,
      wpJournalistID: role === UserRole.JOURNALIST ? wpJournalistID : undefined,
    }
  }
}
