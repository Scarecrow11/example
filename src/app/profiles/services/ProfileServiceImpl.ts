import * as Knex from 'knex'
import { inject, injectable } from 'tsyringe'

import { ConfirmationCodeUtility } from '../../common/ConfirmationCodeUtility'
import { Language } from '../../common/Language'
import { TrxProvider } from '../../db/TrxProvider'
import { TrxUtility } from '../../db/TrxUtility'
import {
  ConflictErrorCodes,
  NotFoundErrorCodes,
  ValidationErrorCodes,
} from '../../error/DetailErrorCodes'
import { DatabaseErrorCodes } from '../../error/ErrorCodes'
import { ServerError } from '../../error/ServerError'
import { EntityFilter } from '../../generic/model/EntityFilter'
import { PagedList } from '../../generic/model/PagedList'
import { logger } from '../../logger/LoggerFactory'
import { PersonDAO } from '../../person/db/PersonDAO'
import { Person } from '../../person/model/Person'
import { ACS } from '../../security/acs/models/ACS'
import { GrandAccessACS } from '../../security/acs/strategies'
import { AuthDAOImpl } from '../../security/auth/db/AuthDAOImpl'
import { AuthProvider } from '../../security/auth/services/AuthProvider'
import { UserDAO } from '../../users/db/UserDAO'
import { UserDetailsDAO } from '../../users/db/UserDetailsDAO'
import { ProfileDAO } from '../db/ProfileDAO'
import { ProfileListDTO } from '../dto/ProfileListDTO'
import { Profile } from '../models/Profile'
import { getSystemStatus } from '../validator/VerifiedProfileValidator'
import { ProfileService } from './ProfileService'

@injectable()
export class ProfileServiceImpl implements ProfileService {
  constructor(
    @inject('ProfileDAO') private dao: ProfileDAO,
    @inject('UserDAO') private userDAO: UserDAO,
    @inject('PersonDAO') private personDAO: PersonDAO,
    @inject('UserDetailsDAO') private userDetailsDAO: UserDetailsDAO,
    @inject('DBConnection') private db: Knex,
    @inject('AuthProvider') private authProvider: AuthProvider,
  ) {}

  public async confirmPhone(username: string, code: number, acs: ACS): Promise<void> {
    logger.debug('profile.service.confirm-phone.start')
    return TrxUtility.transactional<void>(this.db, async trxProvider => {
      logger.debug('profile.service.confirm-phone.process')
      await this.userDetailsDAO.confirmPhone(trxProvider, code, acs)

      await this.updateSystemStatusByUsername(trxProvider, username)
      logger.debug('profile.service.confirm-phone.done')
    })
  }

  public async confirmEmail(code: string): Promise<void> {
    logger.debug('profile.service.email-confirmation.start')
    return TrxUtility.transactional<void>(this.db, async trxProvider => {
      const userUID = await this.userDetailsDAO.updateEmailConfirmation(trxProvider, code)
      await this.updateSystemStatus(trxProvider, userUID)
      logger.debug('profile.service.email-confirmation.done')
    })
  }

  public async get(email: string, acs: ACS): Promise<Profile | undefined> {
    logger.debug('profile.service.get.start')
    return TrxUtility.transactional<Profile | undefined>(this.db, async trxProvider => {
      const profileData = await this.dao.getByPersonEmail(trxProvider, email, acs)

      logger.debug('profile.service.get.done')
      return profileData
    })
  }

  public async getMyProfile(uid: string): Promise<Profile> {
    logger.debug('profile.service.get-my-profile.start')
    return TrxUtility.transactional<Profile>(this.db, async trxProvider => {
      const profile = await this.dao.getMyProfile(trxProvider, uid)

      logger.debug('profile.service.get-my-profile.done')
      return profile
    })
  }

  public async list(filter: EntityFilter, acs: ACS): Promise<PagedList<ProfileListDTO>> {
    logger.debug('profile.service.list.start')
    return TrxUtility.transactional<PagedList<ProfileListDTO>>(this.db, async trxProvider => {
      const list = await this.dao.list(trxProvider, filter, acs)
      logger.debug('profile.service.list.done')
      return list
    })
  }

  public async create(
    profile: Profile,
    acs: ACS,
    language = Language.UA,
    sendEmail = false,
  ): Promise<string> {
    logger.debug('profile.service.create.start')
    return TrxUtility.transactional<string>(this.db, async trxProvider => {
      logger.debug('profile.service.create.get-profile')
      profile = ConfirmationCodeUtility.addEmailConfirmationCode(profile)
      const { user, person, details } = profile
      const getUser = await this.personDAO.getByEmail(trxProvider, person.email as string)

      if (getUser) {
        logger.debug('profile.service.create.error')
        throw new ServerError(
          `User with email ${person.email} already exists`,
          409,
          ConflictErrorCodes.EXIST_ERROR,
          'email',
        )
      }

      logger.debug('profile.service.create.person')
      const personUID = await this.personDAO.saveOrUpdate(trxProvider, person, acs)

      logger.debug('profile.service.create.user')
      const newUserUid = await this.userDAO.saveOrUpdate(
        trxProvider,
        {
          personUID,
          ...user,
          systemStatus: getSystemStatus(profile),
        },
        acs,
      )

      logger.debug('profile.service.create.details')

      await this.userDetailsDAO.saveOrUpdate(
        trxProvider,
        {
          uid: newUserUid,
          new: true,
          ...details,
        },
        acs,
      )

      logger.debug('profile.service.create.done')
      return newUserUid
    })
  }

  public async deleteProfile(username: string, acs: ACS): Promise<void> {
    logger.debug('profile.service.delete-profile.start')
    await TrxUtility.transactional<void>(this.db, async trxProvider => {
      const user = await this.userDAO.findUser(trxProvider, username)
      if (user && user.uid && user.personUID) {
        if (acs.fullAccess || user.uid === acs.toArray()[0]) {
          await this.userDAO.delete(trxProvider, user.uid, acs)
          await this.personDAO.delete(trxProvider, user.personUID, acs)
          await this.userDetailsDAO.delete(trxProvider, user.uid, acs)
        } else {
          throw new ServerError(
            'Not found [profile] entity for delete-profile',
            404,
            NotFoundErrorCodes.ENTITY_NOT_FOUND_ERROR,
            'delete-profile',
          )
        }
      }
      logger.debug('profile.service.delete-profile.done')
    })
  }

  public async updateOwnEmail(
    profile: Profile,
    newEmail: string,
    acs: ACS,
    language: Language = Language.UA,
  ): Promise<void> {
    logger.debug('profile.service.update-email.start.for:', profile.user.username)

    const newProfile = ConfirmationCodeUtility.addEmailConfirmationCode(profile)

    await TrxUtility.transactional<void>(this.db, async trxProvider => {
      await AuthDAOImpl.deleteByUsername(trxProvider, newProfile.user.username)

      try {
        await this.userDAO.updateUsername(trxProvider, newEmail, acs)
        await this.personDAO.updateEmail(trxProvider, newEmail, acs)
      } catch (error) {
        if (error.code === DatabaseErrorCodes.PG_UNIQUE_ERROR_CODE) {
          throw new ServerError(
            `Email is already exits`,
            409,
            ConflictErrorCodes.EXIST_ERROR,
            'profile',
          )
        }
        throw error
      }

      await this.userDetailsDAO.unconfirmEmail(trxProvider, newProfile.details, acs)

      await this.updateSystemStatus(trxProvider, newProfile.user.uid as string)
    })


    logger.debug('profile.service.update-email.done.for:', profile.user.username)
  }

  public async updateOwnPhone(profile: Profile, newPhone: string, acs: ACS): Promise<void> {
    logger.debug(`profile.service.update-own-phone.start.for:[${profile.user.username}]`)

    const newProfile = ConfirmationCodeUtility.addPhoneConfirmationCode(profile)

    await TrxUtility.transactional<void>(this.db, async trxProvider => {
      await this.personDAO.updatePhone(trxProvider, newPhone, acs)

      await this.userDetailsDAO.unconfirmPhone(trxProvider, newProfile.details, acs)

      await this.updateSystemStatusByUsername(trxProvider, profile.user.username)
    })

    logger.debug(`profile.service.update-own-phone.done.for:[${profile.user.username}]`)
  }

  public async updatePersonByUsername(
    username: string,
    person: Person,
    acs: ACS,
    userUID?: string,
  ): Promise<void> {
    logger.debug('profile.service.update-person-by-username.start')
    return TrxUtility.transactional<void>(this.db, async trxProvider => {
      await this.personDAO.updateByUsername(trxProvider, username, person, acs)

      if (!acs.fullAccess) {
        if (!userUID) {
          throw new ServerError(
            'Cant update user uid not found',
            400,
            ValidationErrorCodes.FIELD_REQUIRED_VALIDATION_ERROR,
            'profile',
          )
        }

      }
      await this.updateSystemStatusByUsername(trxProvider, username)
      logger.debug('profile.service.update-person-by-email.done')
    })
  }

  public async updatePassword(username: string, newPassword: string, acs: ACS): Promise<void> {
    logger.debug('profile.service.update-password.start.for:', username)
    await TrxUtility.transactional<void>(this.db, async trxProvider => {
      await this.userDAO.updatePassword(trxProvider, username, newPassword, acs)
    })
    logger.debug('profile.service.update-password.done.for:', username)
  }

  public async resetPassword(email: string): Promise<void> {
    logger.debug('profile.service.init-password-resetting.start')
    const resetPasswordCode = ConfirmationCodeUtility.createHashCode(email)

    await TrxUtility.transactional<void>(this.db, async trxProvider => {
      const result = await this.userDetailsDAO.resetPassword(trxProvider, email, resetPasswordCode)

      if (!result) {
        throw new ServerError(
          'Too many re-sending password code requests',
          400,
          ValidationErrorCodes.TOO_MANY_RESENDING_CODE_ERROR,
          'profile',
        )
      }
    })
    logger.debug('profile.service.init-password-resetting.done')
  }

  public async setNewPassword(passwordRestorationCode: string, newPassword: string): Promise<void> {
    logger.debug('profile.service.set-new-password.start')
    await TrxUtility.transactional<void>(this.db, async trxProvider => {
      await this.userDAO.setNewPassword(trxProvider, passwordRestorationCode, newPassword)
    })
    logger.debug('profile.service.set-new-password.done')
  }

  private async updateSystemStatusByUsername(
    trxProvider: TrxProvider,
    username: string,
  ): Promise<void> {
    logger.debug('profile.service.update-system-status-by-username.start')
    const profile = await this.dao.getByUsername(trxProvider, username, new GrandAccessACS())
    if (profile) {
      await this.userDAO.updateSystemStatus(trxProvider, profile)
    }
    logger.debug('profile.service.update-system-status-by-username.done')
  }

  private async updateSystemStatus(trxProvider: TrxProvider, userUID: string): Promise<void> {
    logger.debug('profile.service.update-system-status.start')
    const profile = await this.dao.getMyProfile(trxProvider, userUID)

    if (profile) {
      await this.userDAO.updateSystemStatus(trxProvider, profile)
    }
    logger.debug('profile.service.update-system-status.done')
  }
}
