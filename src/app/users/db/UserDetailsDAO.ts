import { Language } from '../../common/Language'
import { TrxProvider } from '../../db/TrxProvider'
import { GenericDAO } from '../../generic/dao/GenericDAO'
import { ACS } from '../../security/acs/models/ACS'
import { UserDetails } from '../models/UserDetails'

export interface UserDetailsDAO extends GenericDAO<UserDetails> {
  updateByUsername(
    trxProvider: TrxProvider,
    userDetails: UserDetails,
    username: string,
    acs: ACS,
  ): Promise<void>

  updateEmailConfirmation(trxProvider: TrxProvider, code: string): Promise<string>

  savePhoneConfirmationCode(trxProvider: TrxProvider, code: number, acs: ACS): Promise<void>

  saveEmailConfirmationCode(trxProvider: TrxProvider, code: string, acs: ACS): Promise<void>

  confirmPhone(trxProvider: TrxProvider, code: number, acs: ACS): Promise<void>

  unconfirmPhone(trxProvider: TrxProvider, userDetails: UserDetails, acs: ACS): Promise<void>

  unconfirmEmail(trxProvider: TrxProvider, userDetails: UserDetails, acs: ACS): Promise<void>

  getWpJournalistId(trxProvider: TrxProvider, wpAuthorUid: number): Promise<string | undefined>

  resetPassword(trxProvider: TrxProvider, email: string, code: string): Promise<number>

  updateFacebookId(trxProvider: TrxProvider, facebookId: string, acs: ACS): Promise<void>

  updateGoogleId(trxProvider: TrxProvider, googleId: string, acs: ACS): Promise<void>

  removeFacebookId(trxProvider: TrxProvider, email: string, acs: ACS): Promise<void>

  removeGoogleId(trxProvider: TrxProvider, email: string, acs: ACS): Promise<void>

  updateUserLanguage(
    trxProvider: TrxProvider,
    language: Language,
    username: string,
    acs: ACS,
  ): Promise<void>
}
