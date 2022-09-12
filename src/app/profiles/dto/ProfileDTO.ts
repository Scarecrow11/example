import { Language } from '../../common/Language'
import { UserRole } from '../../common/UserRole'
import { UserSystemStatus } from '../../users/models/UserSystemStatus'

export interface ProfileDTO {
  readonly uid?: string
  readonly firstName: string
  readonly middleName: string
  readonly lastName: string
  readonly jobTitle: string
  readonly legalName: string
  readonly shortName: string
  readonly email: string
  readonly phone: string
  readonly birthdayAt: Date
  readonly gender: string
  readonly bio: string
  readonly username: string
  readonly role: UserRole
  readonly systemStatus: UserSystemStatus
  readonly emailConfirmed: boolean
  readonly phoneConfirmed: boolean
  readonly avatar: string
  readonly language?: Language
}
