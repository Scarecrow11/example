import { TrxProvider } from '../../../db/TrxProvider'
import { AuthData } from '../models/AuthData'
import { NotificationAuthData } from '../models/NotificationAuthData'

export interface AuthDAO {
  saveRefreshToken(trxProvider: TrxProvider, authData: AuthData): Promise<void>

  dropExceedingSessionsIfAny(trxProvider: TrxProvider, username: string): Promise<void>

  dropDeviceTokenIfAny(trxProvider: TrxProvider, deviceToken: string): Promise<void>

  get(trxProvider: TrxProvider, uid: string): Promise<AuthData | undefined>

  delete(trxProvider: TrxProvider, uid: string): Promise<void>

  getDeviceTokens(
    trxProvider: TrxProvider,
    userUIDs: Array<string>,
  ): Promise<Array<NotificationAuthData>>

  getTokenDataForNewPollNotification(trxProvider: TrxProvider): Promise<Array<NotificationAuthData>>
}
