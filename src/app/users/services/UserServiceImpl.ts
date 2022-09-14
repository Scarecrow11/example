import * as Knex from 'knex'
import { inject, injectable } from 'tsyringe'

import { TrxUtility } from '../../db/TrxUtility'
import { GenericServiceImpl } from '../../generic/service/GenericServiceImpl'
import { logger } from '../../logger/LoggerFactory'
import { UserDAO } from '../db/UserDAO'
import { User } from '../models/User'
import { UserService } from './UserService'

@injectable()
export class UserServiceImpl extends GenericServiceImpl<User, UserDAO> implements UserService {
  constructor(@inject('UserDAO') dao: UserDAO, @inject('DBConnection') db: Knex) {
    super(dao, db)
  }
  public async findUser(username: string): Promise<User | undefined> {
    logger.debug('user.service.find-by-email.start')
    return TrxUtility.transactional<User | undefined>(this.db, async trxProvider => {
      const user = await this.dao.findUser(trxProvider, username)
      logger.debug('user.service.find-by-email.done')
      return user
    })
  }


  public async findByEmail(email: string): Promise<User | undefined> {
    logger.debug('user.service.find-by-email.start')
    return TrxUtility.transactional<User | undefined>(this.db, async trxProvider => {
      const user = await this.dao.findUserByEmail(trxProvider, email)
      logger.debug('user.service.find-by-email.done')
      return user
    })
  }

  public async updateUserLastLogin(username: string): Promise<void> {
    logger.debug('user.service.last-login-upd.start')
    return TrxUtility.transactional<void>(this.db, async trxProvider => {
      await this.dao.updateUserLastLogin(trxProvider, username)
      logger.debug('user.service.last-login-upd.done')
    })
  }
}
