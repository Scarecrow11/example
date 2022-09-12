import { Language } from '../../common/Language'
import { EntityFilter } from '../../generic/model/EntityFilter'
import { PagedList } from '../../generic/model/PagedList'
import { Person } from '../../person/model/Person'
import { ACS } from '../../security/acs/models/ACS'
import { ProfileListDTO } from '../dto/ProfileListDTO'
import { Profile } from '../models/Profile'

export interface ProfileService {
  get(email: string, acs: ACS): Promise<Profile | undefined>

  list(filter: EntityFilter, acs: ACS): Promise<PagedList<ProfileListDTO>>

  create(profile: Profile, acs: ACS, language?: Language, sendEmail?: boolean): Promise<string>

  getMyProfile(userUID: string): Promise<Profile>

  deleteProfile(username: string, acs: ACS): Promise<void>

  confirmEmail(code: string): Promise<void>

  confirmPhone(username: string, code: number, acs: ACS): Promise<void>

  updateOwnEmail(profile: Profile, newEmail: string, acs: ACS, language?: Language): Promise<void>

  updateOwnPhone(profile: Profile, newPhone: string, acs: ACS): Promise<void>

  updatePersonByUsername(
    username: string,
    person: Person,
    acs: ACS,
    userUID?: string,
  ): Promise<void>

  updatePassword(username: string, newPassword: string, acs: ACS): Promise<void>

  resetPassword(email: string): Promise<void>

  setNewPassword(passwordRestorationCode: string, newPassword: string): Promise<void>

}
