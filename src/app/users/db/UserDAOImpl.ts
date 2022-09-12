import { List } from 'immutable'
import uuidv4 from 'uuid/v4'

import { UserRole } from '../../common/UserRole'
import { DateUtility } from '../../common/utils/DateUtility'
import { TrxProvider } from '../../db/TrxProvider'
import { checkDAOResult } from '../../generic/dao/ErrorsDAO'
import { EntityFilter } from '../../generic/model/EntityFilter'
import { PagedList } from '../../generic/model/PagedList'
import { PaginationMetadata } from '../../generic/model/PaginationMetadata'
import { PaginationUtility } from '../../generic/utils/PaginationUtility'
import { logger } from '../../logger/LoggerFactory'
import { Profile } from '../../profiles/models/Profile'
import { getSystemStatus } from '../../profiles/validator/VerifiedProfileValidator'
import { ACS } from '../../security/acs/models/ACS'
import { AuthServiceImpl } from '../../security/auth/services/AuthServiceImpl'
import { User } from '../models/User'
import { UserSystemStatus } from '../models/UserSystemStatus'
import { UserDAO } from './UserDAO'

export class UserDAOImpl implements UserDAO {
  public saveOrUpdate(trxProvider: TrxProvider, entity: User): Promise<string> {
    if (entity.uid) {
      return this.update(trxProvider, entity).then(() => entity.uid as string)
    } else {
      return this.create(trxProvider, entity)
    }
  }

  public async partialUpdate(
    trxProvider: TrxProvider,
    uid: string,
    user: Partial<User>,
  ): Promise<void> {
    logger.debug('user.dao.partial-update.start')

    const trx = await trxProvider()

    const result = await trx('users')
      .where({ uid })
      .update(user)

    checkDAOResult(result, 'user', 'partial-update')
    logger.debug('user.dao.partial-update.done')
  }

  public async updateByUsername(
    trxProvider: TrxProvider,
    username: string,
    user: User,
  ): Promise<void> {
    logger.debug('user.dao.update-by-username.start')
    const trx = await trxProvider()

    const result = await trx('users')
      .where({ username })
      .update(user)

    checkDAOResult(result, 'users', 'update-by-username')
    logger.debug('user.dao.update-by-username.done')
  }

  private async create(trxProvider: TrxProvider, user: User): Promise<string> {
    logger.debug('user.dao.create.start')
    const uid = uuidv4()

    const trx = await trxProvider()
    await trx('users').insert({
      uid: uid,
      username: user.username,
      password: user.password && AuthServiceImpl.encryptPassword(user.password),
      role: user.role,
      personUID: user.personUID,
      systemStatus: user.systemStatus,
      createdAt: DateUtility.now(),
      lastLoginAt: user.lastLoginAt,
    })

    logger.debug('user.dao.create.done')
    return uid
  }

  private async update(trxProvider: TrxProvider, user: User): Promise<void> {
    logger.debug('user.dao.update.start')
    const trx = await trxProvider()

    const result = await trx('users')
      .where({ uid: user.uid })
      .update({
        username: user.username,
        password: user.password && AuthServiceImpl.encryptPassword(user.password),
        role: user.role,
      })

    checkDAOResult(result, 'user', 'update')
    logger.debug('user.dao.update.done')
  }

  public async get(trxProvider: TrxProvider, uid: string, acs: ACS): Promise<User | undefined> {
    logger.debug('user.dao.get.start')
    const trx = await trxProvider()

    const result = await trx<User | undefined>('users')
      .where({ uid: uid })
      .andWhere(acs.toSQL('uid'))
      .whereNull('deletedAt')
      .first()

    logger.debug('user.dao.get.start')
    return result
  }

  public async delete(trxProvider: TrxProvider, uid: string): Promise<void> {
    logger.debug('user.dao.delete.start')
    const trx = await trxProvider()

    const result = await trx('users')
      .where({ uid: uid })
      .update({
        role: UserRole.DELETED,
        deletedAt: DateUtility.now(),
      })

    checkDAOResult(result, 'user', 'delete')
    logger.debug('user.dao.delete.done')
  }

  public async findUser(trxProvider: TrxProvider, username: string): Promise<User | undefined> {
    logger.debug('user.dao.find-user.start')
    const trx = await trxProvider()

    const result = await trx<User | undefined>('users')
      .where({ username: username })
      .whereNull('deletedAt')
      .first()

    logger.debug('user.dao.find-user.start')
    return result
  }

  public async findUserByGoogleId(
    trxProvider: TrxProvider,
    googleId: string,
  ): Promise<User | undefined> {
    logger.debug('user.dao.find-user-by-googleId.start')
    const trx = await trxProvider()

    const result = await trx<User | undefined>('users')
      .select('users.*')
      .leftJoin('user_details', 'users.uid', 'user_details.uid')
      .where('user_details.googleId', googleId)
      .whereNull('users.deletedAt')
      .first()

    logger.debug('user.dao.find-user-by-googleId.done')
    return result
  }

  public async findUserByFacebookId(
    trxProvider: TrxProvider,
    facebookId: string,
  ): Promise<User | undefined> {
    logger.debug('user.dao.find-user-by-facebookId.start')
    const trx = await trxProvider()

    const result = await trx<User | undefined>('users')
      .select('users.*')
      .leftJoin('user_details', 'users.uid', 'user_details.uid')
      .where('user_details.facebookId', facebookId)
      .whereNull('users.deletedAt')
      .first()

    logger.debug('user.dao.find-user-by-facebookId.done')
    return result
  }

  public async findUserByEmail(trxProvider: TrxProvider, email: string): Promise<User | undefined> {
    logger.debug('user.dao.find-user-by-email.start')
    const trx = await trxProvider()

    const result = await trx<User | undefined>('users')
      .select('users.*')
      .leftJoin('person', 'users.personUID', 'person.uid')
      .where('person.email', email)
      .whereNull('users.deletedAt')
      .first()

    logger.debug('user.dao.find-user-by-email.done')
    return result
  }

  public async updateUserLastLogin(trxProvider: TrxProvider, uid: string): Promise<void> {
    logger.debug('user.dao.last-login-upd.start')
    const trx = await trxProvider()

    logger.debug('user.dao.last-login-upd.query.start')
    const result = await trx('users')
      .where({ uid: uid })
      .update({
        lastLoginAt: DateUtility.now(),
      })

    checkDAOResult(result, 'user', 'last-login-upd')
    logger.debug('user.dao.last-login-upd.done')
  }

  public async list(
    trxProvider: TrxProvider,
    filter: EntityFilter,
    acs: ACS,
  ): Promise<PagedList<User>> {
    logger.debug('user.dao.list.start')
    const trx = await trxProvider()

    const mainQuery = trx<User>('users')
      .where(acs.toSQL('uid'))
      .whereNull('deletedAt')

    const pageMetadata: PaginationMetadata = await PaginationUtility.calculatePaginationMetadata(
      mainQuery,
      filter,
    )
    logger.debug('user.dao.list.counted')

    const users = await PaginationUtility.applyPaginationForQuery(mainQuery, filter).select('*')

    logger.debug('user.dao.list.done')
    return {
      metadata: pageMetadata,
      list: List(users),
    }
  }

  public async updateUsername(trxProvider: TrxProvider, username: string, acs: ACS): Promise<void> {
    logger.debug('user.dao.username-upd.start')
    const trx = await trxProvider()

    logger.debug('user.dao.username-upd.query.start')
    const result = await trx('users')
      .where(acs.toSQL('uid'))
      .update({ username })

    checkDAOResult(result, 'user', 'username-upd')
    logger.debug('user.dao.username-upd.done')
  }

  public async updatePassword(
    trxProvider: TrxProvider,
    username: string,
    newPassword: string,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user.dao.update-password.start')
    const trx = await trxProvider()

    const result = await trx('users')
      .where({ username })
      .where(acs.toSQL('uid'))
      .update({ password: AuthServiceImpl.encryptPassword(newPassword) })

    checkDAOResult(result, 'user', 'update-password')
    logger.debug('user.dao.update-password.done')
  }

  public async setNewPassword(
    trxProvider: TrxProvider,
    passwordRestorationCode: string,
    newPassword: string,
  ): Promise<void> {
    logger.debug('user.dao.set-new-password.start')
    const trx = await trxProvider()

    const result = await trx('users')
      .whereIn(
        'uid',
        trx('user_details')
          .select('uid')
          .where('passwordRestorationCode', passwordRestorationCode)
          .whereRaw(`now() - "passwordRestorationCodeCreatedAt" < \'00:10:00\'`)
          .first(),
      )
      .update({ password: AuthServiceImpl.encryptPassword(newPassword) })

    checkDAOResult(result, 'user', 'set-new-password')
    logger.debug('user.dao.set-new-password.done')
  }

  public async updateSystemStatus(trxProvider: TrxProvider, profile: Profile): Promise<void> {
    logger.debug('user.dao.update-system-status.start')
    if (profile.user.systemStatus === UserSystemStatus.REJECTED) {
      return
    }
    const systemStatus = getSystemStatus(profile)
    if (systemStatus === profile.user.systemStatus) {
      return
    }

    const trx = await trxProvider()
    const where = profile.user.uid ? { uid: profile.user.uid } : { username: profile.user.username }

    const result = await trx('users')
      .where(where)
      .update({ systemStatus })

    checkDAOResult(result, 'user', 'update-system-status')
    logger.debug('user.dao.update-system-status.done')
  }
}
