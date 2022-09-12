import { Person } from '../../person/model/Person'
import { User } from '../../users/models/User'
import { UserDetails } from '../../users/models/UserDetails'

export interface Profile {
  readonly person: Person
  readonly user: User
  readonly details: UserDetails
}
