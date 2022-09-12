import Knex from 'knex'
import { inject, injectable } from 'tsyringe'

import { TrxUtility } from '../../../db/TrxUtility'
import { logger } from '../../../logger/LoggerFactory'
import { AuthDAO } from '../db/AuthDAO'
import { NotificationAuthData } from '../models/NotificationAuthData'
import { AuthNotificationService } from './AuthNotifcationService'

@injectable()
export class AuthNotificationServiceImpl implements AuthNotificationService {
  constructor(
    @inject('DBConnection') private db: Knex,
    @inject('AuthDAO') private authDao: AuthDAO,
  ) {}

  public async getAuthDataForNewPoll(): Promise<Array<NotificationAuthData>> {
    logger.debug('auth.notification.service.get-auth-data-for-new-poll')
    return TrxUtility.transactional<Array<NotificationAuthData>>(this.db, async trxProvider => {
      return await this.authDao.getTokenDataForNewPollNotification(trxProvider)
    })
  }

  public async getDeviceTokens(userUIDs: Array<string>): Promise<Array<NotificationAuthData>> {
    logger.debug('auth.notification.service.get-device-tokens')
    return TrxUtility.transactional(this.db, async trxProvider => {
      return this.authDao.getDeviceTokens(trxProvider, userUIDs)
    })
  }
}
