
import { GenericEntity } from '../../generic/model/GenericEntity'

export interface Person extends GenericEntity {
  readonly email?: string
  readonly firstName?: string
  readonly middleName?: string
  readonly lastName?: string
  readonly createdAt?: Date
  readonly avatar?: string
}
