
import { UserRole } from '../../common/UserRole'

export interface ProfileTuple {
  readonly firstName: string
  readonly middleName: string
  readonly lastName: string
  readonly jobTitle: string
  readonly legalName: string
  readonly shortName: string
  readonly email: string
  readonly phone: string
  readonly birthdayAt: Date
  readonly username: string
  readonly role: UserRole
  readonly createdAt: Date
}
