import { Gender } from '../../common/Gender'
import { GenericEntity } from '../../generic/model/GenericEntity'

export interface Person extends GenericEntity {
  readonly email?: string
  readonly firstName?: string
  readonly middleName?: string
  readonly lastName?: string
  readonly jobTitle?: string
  readonly legalName?: string
  readonly shortName?: string
  readonly tagline?: string
  readonly phone?: string
  readonly birthdayAt?: Date
  readonly gender?: Gender
  readonly bio?: string
  readonly createdAt?: Date
  readonly avatar?: string
}
