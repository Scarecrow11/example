import { List } from 'immutable'

import { UserRole } from '../../common/UserRole'
import { TrxProvider } from '../../db/TrxProvider'
import { EntityFilter } from '../../generic/model/EntityFilter'
import { PagedList } from '../../generic/model/PagedList'
import { PaginationMetadata } from '../../generic/model/PaginationMetadata'
import { PaginationUtility } from '../../generic/utils/PaginationUtility'
import { logger } from '../../logger/LoggerFactory'
import { ACS } from '../../security/acs/models/ACS'
import { ProfileDTO } from '../dto/ProfileDTO'
import { ProfileDTOHelper } from '../dto/ProfileDTOHelper'
import { ProfileListDTO } from '../dto/ProfileListDTO'
import { ProfileTuple } from '../dto/ProfileTuple'
import { Profile } from '../models/Profile'
import { ProfileDAO } from './ProfileDAO'

export class ProfileDAOImpl implements ProfileDAO {
  public async getByUsername(
    trxProvider: TrxProvider,
    username: string,
    acs: ACS,
  ): Promise<Profile | undefined> {
    logger.debug('profile.dao.get-by-username.start')
    const trx = await trxProvider()

    const dtoProfile = await trx<ProfileDTO | undefined>('person')
      .select(
        'users.username as username',
        'users.role as role',
        'users.systemStatus as systemStatus',
        'person.isLegalPerson as isLegalPerson',
        'person.isPublicPerson as isPublicPerson',
        'person.firstName as firstName',
        'person.middleName as middleName',
        'person.lastName as lastName',
        'person.jobTitle as jobTitle',
        'person.legalName as legalName',
        'person.shortName as shortName',
        'person.tagline as tagline',
        'person.email as email',
        'person.phone as phone',
        'person.birthdayAt as birthdayAt',
        'person.gender as gender',
        'person.socialStatus as socialStatus',
        'person.bio as bio',
        'person.addressRegion as addressRegion',
        'person.addressDistrict as addressDistrict',
        'person.addressTown as addressTown',
        'person.avatar as avatar',
        'user_details.emailConfirmed as emailConfirmed',
        'user_details.phoneConfirmed as phoneConfirmed',
        'user_details.notifyViber as notifyViber',
        'user_details.notifyTelegram as notifyTelegram',
        'user_details.notifySMS as notifySMS',
        'user_details.notifyEmail as notifyEmail',
        'user_details.notifyAboutNewPoll as notifyAboutNewPoll',
        'user_details.linkFacebook as linkFacebook',
        'user_details.linkGoogle as linkGoogle',
        'user_details.linkSite as linkSite',
        'user_details.wpJournalistID as wpJournalistID',
        'user_details.googleId as googleId',
        'user_details.facebookId as facebookId',
        'user_details.language as language',
      )
      .leftJoin('users', 'users.personUID', 'person.uid')
      .leftJoin('user_details', 'user_details.uid', 'users.uid')
      .where('users.username', username)
      .where(acs.toSQL('users.uid'))
      .whereNull('person.deletedAt')
      .first()

    logger.debug('profile.dao.get-by-username.done')
    return dtoProfile && ProfileDTOHelper.constructSimpleDTOToProfile(dtoProfile)
  }

  public async list(
    trxProvider: TrxProvider,
    filter: EntityFilter,
  ): Promise<PagedList<ProfileListDTO>> {
    logger.debug('profile.dao.list.start')
    const trx = await trxProvider()

    const mainQuery = trx<ProfileTuple>('person')
      .leftJoin('users', 'users.personUID', 'person.uid')
      .whereNot('users.role', UserRole.PRIVATE)
      .whereNull('person.deletedAt')

    const pageMetadata: PaginationMetadata = await PaginationUtility.calculatePaginationMetadata(
      mainQuery,
      filter,
      'person.uid',
    )
    logger.debug('profile.dao.list.counted')

    const list = await trx<ProfileTuple>('person')
      .leftJoin('users', 'users.personUID', 'person.uid')
      .select(
        'person.isLegalPerson as isLegalPerson',
        'person.firstName as firstName',
        'person.middleName as middleName',
        'person.lastName as lastName',
        'person.jobTitle as jobTitle',
        'person.legalName as legalName',
        'person.shortName as shortName',
        'person.email as email',
        'person.phone as phone',
        'person.birthdayAt as birthdayAt',
        'person.addressRegion as addressRegion',
        'person.addressDistrict as addressDistrict',
        'person.addressTown as addressTown',
        'users.username as username',
        'users.role as role',
        'users.createdAt as createdAt',
      )
      .whereIn(
        'person.uid',
        PaginationUtility.applyPaginationForQuery(mainQuery, filter).select('person.uid'),
      )

    logger.debug('profile.dao.list.done')
    return {
      metadata: pageMetadata,
      list: List(ProfileDTOHelper.multipliesProfiles(list)),
    }
  }

  public async getMyProfile(trxProvider: TrxProvider, userUID: string): Promise<Profile> {
    logger.debug('profile.dao.get-my-profile.start')
    const trx = await trxProvider()

    const dtoProfile = await trx<ProfileDTO | undefined>('person')
      .select(
        'users.uid as uid',
        'users.username as username',
        'users.role as role',
        'users.systemStatus as systemStatus',
        'person.isLegalPerson as isLegalPerson',
        'person.isPublicPerson as isPublicPerson',
        'person.firstName as firstName',
        'person.middleName as middleName',
        'person.lastName as lastName',
        'person.jobTitle as jobTitle',
        'person.legalName as legalName',
        'person.shortName as shortName',
        'person.tagline as tagline',
        'person.email as email',
        'person.phone as phone',
        'person.birthdayAt as birthdayAt',
        'person.gender as gender',
        'person.socialStatus as socialStatus',
        'person.bio as bio',
        'person.addressRegion as addressRegion',
        'person.addressDistrict as addressDistrict',
        'person.addressTown as addressTown',
        'person.avatar as avatar',
        'user_details.emailConfirmed as emailConfirmed',
        'user_details.phoneConfirmed as phoneConfirmed',
        'user_details.notifyViber as notifyViber',
        'user_details.notifyTelegram as notifyTelegram',
        'user_details.notifySMS as notifySMS',
        'user_details.notifyEmail as notifyEmail',
        'user_details.notifyAboutNewPoll as notifyAboutNewPoll',
        'user_details.linkFacebook as linkFacebook',
        'user_details.linkGoogle as linkGoogle',
        'user_details.linkSite as linkSite',
        'user_details.wpJournalistID as wpJournalistID',
        'user_details.googleId as googleId',
        'user_details.facebookId as facebookId',
        'user_details.language as language',
      )
      .leftJoin('users', 'users.personUID', 'person.uid')
      .leftJoin('user_details', 'user_details.uid', 'users.uid')
      .where('users.uid', userUID)
      .first()

    logger.debug('profile.dao.get-my-profile.done')
    return dtoProfile && ProfileDTOHelper.constructSimpleDTOToProfile(dtoProfile)
  }

  public async getByPersonEmail(
    trxProvider: TrxProvider,
    email: string,
    acs: ACS,
  ): Promise<Profile | undefined> {
    logger.debug('profile.dao.get-by-person-email.start')
    const trx = await trxProvider()

    const dtoProfile = await trx<ProfileDTO | undefined>('person')
      .select(
        'users.username as username',
        'users.role as role',
        'users.systemStatus as systemStatus',
        'person.isLegalPerson as isLegalPerson',
        'person.isPublicPerson as isPublicPerson',
        'person.firstName as firstName',
        'person.middleName as middleName',
        'person.lastName as lastName',
        'person.jobTitle as jobTitle',
        'person.legalName as legalName',
        'person.shortName as shortName',
        'person.tagline as tagline',
        'person.email as email',
        'person.phone as phone',
        'person.birthdayAt as birthdayAt',
        'person.gender as gender',
        'person.socialStatus as socialStatus',
        'person.bio as bio',
        'person.addressRegion as addressRegion',
        'person.addressDistrict as addressDistrict',
        'person.addressTown as addressTown',
        'person.avatar as avatar',
        'user_details.emailConfirmed as emailConfirmed',
        'user_details.phoneConfirmed as phoneConfirmed',
        'user_details.notifyViber as notifyViber',
        'user_details.notifyTelegram as notifyTelegram',
        'user_details.notifySMS as notifySMS',
        'user_details.notifyEmail as notifyEmail',
        'user_details.notifyAboutNewPoll as notifyAboutNewPoll',
        'user_details.linkFacebook as linkFacebook',
        'user_details.linkGoogle as linkGoogle',
        'user_details.linkSite as linkSite',
        'user_details.wpJournalistID as wpJournalistID',
        'user_details.googleId as googleId',
        'user_details.facebookId as facebookId',
        'user_details.language as language',
      )
      .leftJoin('users', 'users.personUID', 'person.uid')
      .leftJoin('user_details', 'user_details.uid', 'users.uid')
      .where('person.email', email)
      .where(acs.toSQL('users.uid'))
      .whereNull('person.deletedAt')
      .first()

    logger.debug('profile.dao.get-by-person-email.done')
    return dtoProfile && ProfileDTOHelper.constructSimpleDTOToProfile(dtoProfile)
  }
}
