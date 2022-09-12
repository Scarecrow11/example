import { GenericService } from '../../generic/service/GenericService'
import { Person } from '../model/Person'

export interface PersonService extends GenericService<Person> {
  getByUserUID(userUID: string): Promise<Person | undefined>

  getByEmail(email: string): Promise<Person | undefined>
}
