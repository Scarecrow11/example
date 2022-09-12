import { GenericEntity } from '../../../generic/model/GenericEntity'
import { HeaderInfo } from './HeaderInfo'

export interface AuthData extends GenericEntity {
  username: string
  refreshTokenHash: string
  headerInfo: HeaderInfo
  deviceToken?: string
  createdAt?: Date
}
