import { TrxProvider } from '../../db/TrxProvider'
import { EntityFilter } from '../../generic/model/EntityFilter'
import { PagedList } from '../../generic/model/PagedList'
import { ACS } from '../../security/acs/models/ACS'
import { ProfileListDTO } from '../dto/ProfileListDTO'
import { Profile } from '../models/Profile'

export interface ProfileDAO {
  getByUsername(trxProvider: TrxProvider, username: string, acs: ACS): Promise<Profile | undefined>

  list(trxProvider: TrxProvider, filter: EntityFilter, acs: ACS): Promise<PagedList<ProfileListDTO>>

  getMyProfile(trxProvider: TrxProvider, userUID: string): Promise<Profile>

  getByPersonEmail(trxProvider: TrxProvider, email: string, acs: ACS): Promise<Profile | undefined>
}
