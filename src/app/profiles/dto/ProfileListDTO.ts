import { Person } from '../../person/model/Person'
import { User } from '../../users/models/User'

export interface ProfileListDTO {
  readonly person: Person
  readonly user: User
}
