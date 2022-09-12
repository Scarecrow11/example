import { UserRole } from '../../common/UserRole'
import { GenericEntity } from '../../generic/model/GenericEntity'
import { UserSystemStatus } from './UserSystemStatus'

export interface User extends GenericEntity {
  readonly username: string
  readonly password?: string
  readonly role: UserRole
  readonly systemStatus?: UserSystemStatus
  readonly createdAt?: Date
  readonly lastLoginAt?: Date
  readonly personUID?: string
}
