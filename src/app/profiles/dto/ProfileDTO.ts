import { Language } from '../../common/Language'
import { UserRole } from '../../common/UserRole'
import { UserSystemStatus } from '../../users/models/UserSystemStatus'

export interface ProfileDTO {
  readonly uid?: string
  readonly firstName: string
  readonly middleName: string
  readonly lastName: string
  readonly email: string
  readonly birthdayAt: Date
  readonly username: string
  readonly role: UserRole
  readonly systemStatus: UserSystemStatus
  readonly avatar: string
  readonly language?: Language
}
