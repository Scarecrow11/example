import { Language } from '../../common/Language'
import { GenericService } from '../../generic/service/GenericService'
import { ACS } from '../../security/acs/models/ACS'
import { UserDetails } from '../models/UserDetails'

export interface UserDetailsService extends GenericService<UserDetails> {
  updateByUsername(person: UserDetails, username: string, acs: ACS): Promise<void>

  updateUserLanguageByUsername(language: Language, username: string, acs: ACS): Promise<void>
}
