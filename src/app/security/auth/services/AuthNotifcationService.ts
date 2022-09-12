import { NotificationAuthData } from '../models/NotificationAuthData'

export interface AuthNotificationService {
  getAuthDataForNewPoll(): Promise<Array<NotificationAuthData>>

  getDeviceTokens(userUIDs: Array<string>): Promise<Array<NotificationAuthData>>
}
