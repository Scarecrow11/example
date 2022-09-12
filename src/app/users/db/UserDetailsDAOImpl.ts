import { List } from 'immutable'

import { phoneExpireTime } from '../../../../config/phoneConfig'
import { Language } from '../../common/Language'
import { DateUtility } from '../../common/utils/DateUtility'
import { TrxProvider } from '../../db/TrxProvider'
import { ValidationErrorCodes } from '../../error/DetailErrorCodes'
import { ServerError } from '../../error/ServerError'
import { checkDAOResult } from '../../generic/dao/ErrorsDAO'
import { PagedList } from '../../generic/model/PagedList'
import { logger } from '../../logger/LoggerFactory'
import { ACS } from '../../security/acs/models/ACS'
import { UserDetails } from '../models/UserDetails'
import { UserDetailsDAO } from './UserDetailsDAO'

export class UserDetailsDAOImpl implements UserDetailsDAO {
  public async getWpJournalistId(
    trxProvider: TrxProvider,
    wpAuthorUid: number,
  ): Promise<string | undefined> {
    const trx = await trxProvider()

    const result = await trx('user_details')
      .select('uid')
      .where({ wpJournalistID: wpAuthorUid })
      .first()

    return result?.uid
  }

  public async savePhoneConfirmationCode(
    trxProvider: TrxProvider,
    code: number,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user-details.dao.save-phone-confirmation.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .where(acs.toSQL('uid'))
      .whereRaw(
        `date_part('minute', now() - COALESCE("phoneConfirmationCodeCreatedAt", '2010-01-01 00:00:00'::timestamp)) >= 2`,
      )
      .update({
        phoneConfirmationCode: code,
        phoneConfirmationCodeCreatedAt: DateUtility.now(),
      })

    checkDAOResult(result, 'user-details', 'save-phone-confirmation')
    logger.debug('user-details.dao.save-phone-confirmation.done')
  }

  public async confirmPhone(trxProvider: TrxProvider, code: number, acs: ACS): Promise<void> {
    logger.debug('user-details.dao.delete-phone-confirmation.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .where({ phoneConfirmationCode: code })
      .where(acs.toSQL('uid'))
      .whereRaw(`now() - "phoneConfirmationCodeCreatedAt" < ${phoneExpireTime}`)
      .update({
        phoneConfirmed: true,
        phoneConfirmationCode: null,
        phoneConfirmationCodeCreatedAt: null,
      })

    checkDAOResult(result, 'user-details', 'delete-phone-confirmation')
    logger.debug('user-details.dao.delete-phone-confirmation.done')
  }

  public async unconfirmPhone(
    trxProvider: TrxProvider,
    userDetails: UserDetails,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user-details.dao.unconfirm-phone.start')
    const trx = await trxProvider()
    const result = await trx('user_details')
      .where(acs.toSQL('uid'))
      .update({
        phoneConfirmed: false,
        phoneConfirmationCode: userDetails.phoneConfirmationCode,
        phoneConfirmationCodeCreatedAt: userDetails.phoneConfirmationCodeCreatedAt,
      })

    checkDAOResult(result, 'user-details', 'unconfirm-phone')
    logger.debug('user-details.dao.unconfirm-phone.done')
  }

  public async saveEmailConfirmationCode(
    trxProvider: TrxProvider,
    code: string,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user-details.dao.save-email-confirmation.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .where(acs.toSQL('uid'))
      .whereRaw(
        `date_part('minute', now() - COALESCE("emailConfirmationCodeCreatedAt", '2010-01-01 00:00:00'::timestamp)) >= 2`,
      )
      .update({
        emailConfirmationCode: code,
        emailConfirmationCodeCreatedAt: DateUtility.now(),
      })

    checkDAOResult(result, 'user-details', 'save-email-confirmation')
    logger.debug('user-details.dao.save-email-confirmation.done')
  }

  public async updateEmailConfirmation(trxProvider: TrxProvider, code: string): Promise<string> {
    logger.debug('user-details.dao.update-email-confirmation.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .where({ emailConfirmationCode: code })
      .update({
        emailConfirmed: true,
        emailConfirmationCode: null,
        emailConfirmationCodeCreatedAt: null,
      })
      .returning('uid')

    checkDAOResult(result.length, 'user-details', 'update-email-confirmation')
    logger.debug('user-details.dao.update-email-confirmation.done')
    return result[0]
  }

  public async unconfirmEmail(
    trxProvider: TrxProvider,
    userDetails: UserDetails,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user-details.dao.unconfirm-email.start')
    const trx = await trxProvider()
    const result = await trx('user_details')
      .where(acs.toSQL('uid'))
      .update({
        emailConfirmed: false,
        emailConfirmationCode: userDetails.emailConfirmationCode,
        emailConfirmationCodeCreatedAt: userDetails.emailConfirmationCodeCreatedAt,
      })

    checkDAOResult(result, 'user-details', 'unconfirm-email')
    logger.debug('user-details.dao.unconfirm-email.done')
  }

  public async saveOrUpdate(trxProvider: TrxProvider, entity: UserDetails): Promise<string> {
    logger.debug('user-details.dao.save-or-update')
    if (entity.new) {
      return this.create(trxProvider, entity)
    } else {
      await this.update(trxProvider, entity)
      return entity.uid as string
    }
  }

  private async create(trxProvider: TrxProvider, userDetails: UserDetails): Promise<string> {
    logger.debug('user-details.dao.create.start')

    if (!userDetails.uid) {
      throw new ServerError(
        'User details UID is required',
        400,
        ValidationErrorCodes.FIELD_REQUIRED_VALIDATION_ERROR,
        'user-details',
      )
    }

    const trx = await trxProvider()
    await trx('user_details').insert({
      uid: userDetails.uid,
      googleId: userDetails.googleId,
      facebookId: userDetails.facebookId,
      wpJournalistID: userDetails.wpJournalistID,
      emailConfirmed: userDetails.emailConfirmed,
      phoneConfirmed: userDetails.phoneConfirmed,
      linkFacebook: userDetails.linkFacebook,
      linkGoogle: userDetails.linkGoogle,
      linkSite: userDetails.linkSite,
      newsPreferences: userDetails.newsPreferences,
      passwordRestorationCode: userDetails.passwordRestorationCode,
      createdAt: DateUtility.now(),
    })
    logger.debug('user-details.dao.create.done')
    return userDetails.uid
  }

  private async update(trxProvider: TrxProvider, userDetails: UserDetails): Promise<void> {
    logger.debug('user-details.dao.update.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .where({ uid: userDetails.uid })
      .update({
        emailConfirmed: userDetails.emailConfirmed,
        phoneConfirmed: userDetails.phoneConfirmed,
        emailConfirmationCode: userDetails.emailConfirmationCode,
        phoneConfirmationCode: userDetails.phoneConfirmationCode,
        emailConfirmationCodeCreatedAt: userDetails.emailConfirmationCodeCreatedAt,
        notifyEmail: userDetails.notifyEmail,
        notifyAboutNewPoll: userDetails.notifyAboutNewPoll,
        notifySMS: userDetails.notifySMS,
        notifyTelegram: userDetails.notifyTelegram,
        notifyViber: userDetails.notifyViber,
        linkFacebook: userDetails.linkFacebook,
        linkGoogle: userDetails.linkGoogle,
        linkSite: userDetails.linkSite,
        newsPreferences: userDetails.newsPreferences,
        passwordRestorationCode: userDetails.passwordRestorationCode,
      })

    checkDAOResult(result, 'user-details', 'update')
    logger.debug('user-details.dao.update.done')
  }

  public async get(trxProvider: TrxProvider, uid: string): Promise<UserDetails | undefined> {
    logger.debug('user-details.dao.get.start')
    const trx = await trxProvider()

    const result = await trx<UserDetails>('user_details')
      .where({ uid: uid })
      .whereNull('deletedAt')
      .first()

    logger.debug('user-details.dao.get.done')

    return result
  }

  public async delete(trxProvider: TrxProvider, uid: string): Promise<void> {
    logger.debug('user-details.dao.delete.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .where({ uid: uid })
      .update({
        deletedAt: DateUtility.now(),
      })

    checkDAOResult(result, 'user-details', 'delete')
    logger.debug('user-details.dao.delete.done')
  }

  public async updateByUsername(
    trxProvider: TrxProvider,
    userDetails: UserDetails,
    username: string,
  ): Promise<void> {
    logger.debug('user-details.dao.update.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .whereIn(
        'uid',
        trx('users')
          .select('uid')
          .where('username', username)
          .first(),
      )
      .update({
        wpJournalistID: userDetails.wpJournalistID,
        notifyEmail: userDetails.notifyEmail,
        notifySMS: userDetails.notifySMS,
        notifyTelegram: userDetails.notifyTelegram,
        notifyViber: userDetails.notifyViber,
        notifyAboutNewPoll: userDetails.notifyAboutNewPoll,
        linkFacebook: userDetails.linkFacebook,
        linkSite: userDetails.linkSite,
        linkGoogle: userDetails.linkGoogle,
        language: userDetails.language,
      })

    checkDAOResult(result, 'user-details', 'update-by-email')
    logger.debug('user-details.dao.update.done')
  }

  public async resetPassword(
    trxProvider: TrxProvider,
    email: string,
    code: string,
  ): Promise<number> {
    logger.debug('user-details.dao.reset-password.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .whereIn(
        'uid',
        trx('users')
          .select('users.uid')
          .where('person.email', email)
          .leftJoin('person', 'person.uid', 'users.personUID')
          .first(),
      )
      .whereNull('deletedAt')
      .whereRaw(
        `date_part('minute', now() - COALESCE("passwordRestorationCodeCreatedAt", '2010-01-01 00:00:00'::timestamp)) >= 2`,
      )
      .update({
        passwordRestorationCode: code,
        passwordRestorationCodeCreatedAt: DateUtility.now(),
      })

    logger.debug('user-details.dao.reset-password.done')
    return result
  }

  public async updateGoogleId(trxProvider: TrxProvider, googleId: string, acs: ACS): Promise<void> {
    logger.debug('user-details.dao.update-googleId.start')

    const trx = await trxProvider()

    const result = await trx('user_details')
      .where(acs.toSQL('uid'))
      .whereNull('googleId')
      .update({ googleId })

    checkDAOResult(result, 'user-details', 'update-googleId')
    logger.debug('user-details.dao.update-googleId.done')
  }

  public async updateFacebookId(
    trxProvider: TrxProvider,
    facebookId: string,
    acs: ACS,
  ): Promise<void> {
    logger.debug('user-details.dao.update-facebookId.start')

    const trx = await trxProvider()

    const result = await trx('user_details')
      .where(acs.toSQL('uid'))
      .whereNull('facebookId')
      .update({ facebookId })

    checkDAOResult(result, 'user-details', 'update-facebookId')
    logger.debug('user-details.dao.update-facebookId.done')
  }

  public async removeGoogleId(trxProvider: TrxProvider, email: string): Promise<void> {
    logger.debug('user-details.dao.remove-googleId.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .update({ googleId: null })
      .whereIn(
        'uid',
        trx('users')
          .select('users.uid')
          .where('person.email', email)
          .leftJoin('person', 'person.uid', 'users.personUID')
          .first(),
      )

    checkDAOResult(result, 'user-details', 'remove-googleId')
    logger.debug('user-details.dao.remove-googleId.done')
  }

  public async removeFacebookId(trxProvider: TrxProvider, email: string): Promise<void> {
    logger.debug('user-details.dao.remove-facebookId.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .update({ facebookId: null })
      .whereIn(
        'uid',
        trx('users')
          .select('users.uid')
          .where('person.email', email)
          .leftJoin('person', 'person.uid', 'users.personUID')
          .first(),
      )

    checkDAOResult(result, 'user-details', 'remove-facebookId')
    logger.debug('user-details.dao.remove-facebookId.done')
  }

  public async list(): Promise<PagedList<UserDetails>> {
    logger.debug('user-details.dao.list.not-supported')
    return {
      metadata: {
        limit: 0,
        offset: 0,
        total: 0,
      },
      list: List([]),
    }
  }

  public async updateUserLanguage(
    trxProvider: TrxProvider,
    language: Language,
    username: string,
  ): Promise<void> {
    logger.debug('user-details.dao.update-user-language.start')
    const trx = await trxProvider()

    const result = await trx('user_details')
      .whereIn(
        'uid',
        trx('users')
          .select('uid')
          .where('username', username)
          .first(),
      )
      .update({ language: language })

    checkDAOResult(result, 'user-details', 'update-user-language')
    logger.debug('user-details.dao.update-user-language.done')
  }
}
