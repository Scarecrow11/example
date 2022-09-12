import { DateUtility } from '../../../common/utils/DateUtility'
import { TrxProvider } from '../../../db/TrxProvider'
import { logger } from '../../../logger/LoggerFactory'
import { AuthData } from '../models/AuthData'
import { NotificationAuthData } from '../models/NotificationAuthData'
import { AuthDAO } from './AuthDAO'

export class AuthDAOImpl implements AuthDAO {
  public static async deleteByUsername(trxProvider: TrxProvider, username: string): Promise<void> {
    logger.debug('auth.dao.delete-by-username.start')
    const trx = await trxProvider()

    await trx('auth_data')
      .where({ username })
      .delete()

    logger.debug('auth.dao.delete-by-username.done')
  }

  private MAX_SESSION_NUMBER = 5

  public async saveRefreshToken(trxProvider: TrxProvider, authData: AuthData): Promise<void> {
    const trx = await trxProvider()
    const headerInfo = {
      ip: authData.headerInfo.ip,
      userAgent: authData.headerInfo.userAgent.ua,
    }
    await trx('auth_data').insert({
      ...authData,
      headerInfo,
      createdAt: DateUtility.now(),
    })
  }

  public async dropDeviceTokenIfAny(trxProvider: TrxProvider, deviceToken: string): Promise<void> {
    const trx = await trxProvider()

    await trx('auth_data')
      .update({ deviceToken: null })
      .where('deviceToken', deviceToken)
  }

  public async dropExceedingSessionsIfAny(
    trxProvider: TrxProvider,
    username: string,
  ): Promise<void> {
    const trx = await trxProvider()
    const maxSession = this.MAX_SESSION_NUMBER
    await trx<AuthData>('auth_data')
      .whereIn('username', function() {
        return this.from('auth_data')
          .select('username')
          .where({ username })
          .groupBy('username')
          .having(trx.raw(`count(*) >= ${maxSession}`))
      })
      .del()
  }

  public async get(trxProvider: TrxProvider, uid: string): Promise<AuthData | undefined> {
    const trx = await trxProvider()
    const data = await trx<AuthData>('auth_data')
      .where({ uid })
      .first()
    return data
  }

  public async delete(trxProvider: TrxProvider, uid: string): Promise<void> {
    const trx = await trxProvider()
    await trx<AuthData>('auth_data')
      .where({ uid })
      .del()
  }

  public async getDeviceTokens(
    trxProvider: TrxProvider,
    userUIDs: Array<string>,
  ): Promise<Array<NotificationAuthData>> {
    const trx = await trxProvider()

    const result = await trx('users')
      .select(
        'users.uid as userUid',
        'auth_data.username as username',
        'auth_data.deviceToken as deviceToken',
      )
      .max('auth_data.createdAt as createdAt')
      .innerJoin('auth_data', 'auth_data.username', 'users.username')
      .whereNotNull('auth_data.deviceToken')
      .whereIn('users.uid', userUIDs)
      .groupBy('auth_data.username')
      .groupBy('auth_data.deviceToken')
      .groupBy('users.uid')

    return result as Array<NotificationAuthData>
  }

  public async getTokenDataForNewPollNotification(
    trxProvider: TrxProvider,
  ): Promise<Array<NotificationAuthData>> {
    const trx = await trxProvider()
    const result = await trx('users')
      .select(
        'users.uid as userUid',
        'auth_data.username as username',
        'auth_data.deviceToken as deviceToken',
      )
      .whereNotNull('auth_data.deviceToken')
      .max('auth_data.createdAt as createdAt')
      .innerJoin('auth_data', 'auth_data.username', 'users.username')
      .whereIn(
        'users.uid',
        trx('user_details')
          .select('user_details.uid')
          .where('user_details.notifyAboutNewPoll', true),
      )
      .groupBy('users.uid')
      .groupBy('auth_data.username')
      .groupBy('auth_data.deviceToken')

    return result as Array<NotificationAuthData>
  }
}
