import { GenericEntity } from '../../../generic/model/GenericEntity'
import { HeaderInfo } from './HeaderInfo'

export interface NotificationAuthData extends GenericEntity {
  userUid: string
  username: string
  deviceToken: string
  headerInfo?: HeaderInfo
  createdAt?: Date
}
