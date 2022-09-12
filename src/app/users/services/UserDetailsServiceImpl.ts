import { List } from 'immutable'
import * as Knex from 'knex'
import { inject, injectable } from 'tsyringe'

import { Language } from '../../common/Language'
import { TrxUtility } from '../../db/TrxUtility'
import { PagedList } from '../../generic/model/PagedList'
import { GenericServiceImpl } from '../../generic/service/GenericServiceImpl'
import { logger } from '../../logger/LoggerFactory'
import { ACS } from '../../security/acs/models/ACS'
import { UserDetailsDAO } from '../db/UserDetailsDAO'
import { UserDetails } from '../models/UserDetails'
import { UserDetailsService } from './UserDetailsService'

@injectable()
export class UserDetailsServiceImpl extends GenericServiceImpl<UserDetails, UserDetailsDAO>
  implements UserDetailsService {
  constructor(@inject('UserDetailsDAO') dao: UserDetailsDAO, @inject('DBConnection') db: Knex) {
    super(dao, db)
  }

  public async list(): Promise<PagedList<UserDetails>> {
    logger.debug('user-details.service.list.not-supported')
    return {
      metadata: {
        limit: 0,
        offset: 0,
        total: 0,
      },
      list: List([]),
    }
  }

  public async updateByUsername(
    userDetails: UserDetails,
    username: string,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user-details.service.update-by-email.start')
    return TrxUtility.transactional<void>(this.db, async trxProvider => {
      logger.debug('user-details.service.update-by-email.process')
      await this.dao.updateByUsername(trxProvider, userDetails, username, acs)
      logger.debug('user-details.service.update-by-email.done')
    })
  }

  public async updateUserLanguageByUsername(
    language: Language,
    username: string,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user-details.service.update-user-language-by-username.start')
    return TrxUtility.transactional<void>(this.db, async trxProvider => {
      logger.debug('user-details.service.update-user-language-by-username.process')
      await this.dao.updateUserLanguage(trxProvider, language, username, acs)
      logger.debug('user-details.service.update-user-language-by-username.done')
    })
  }
}
