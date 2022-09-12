import { TrxProvider } from '../../db/TrxProvider'
import { GenericDAO } from '../../generic/dao/GenericDAO'
import { Profile } from '../../profiles/models/Profile'
import { ACS } from '../../security/acs/models/ACS'
import { User } from '../models/User'

export interface UserDAO extends GenericDAO<User> {
  findUser(trxProvider: TrxProvider, username: string): Promise<User | undefined>

  findUserByGoogleId(trxProvider: TrxProvider, googleId: string): Promise<User | undefined>

  findUserByFacebookId(trxProvider: TrxProvider, facebookId: string): Promise<User | undefined>

  findUserByEmail(trxProvider: TrxProvider, email: string): Promise<User | undefined>

  updateUserLastLogin(trxProvider: TrxProvider, uid: string): Promise<void>

  updateUsername(trxProvider: TrxProvider, username: string, acs: ACS): Promise<void>

  partialUpdate(trxProvider: TrxProvider, uid: string, user: Partial<User>, acs: ACS): Promise<void>

  updatePassword(
    trxProvider: TrxProvider,
    username: string,
    newPassword: string,
    acs: ACS,
  ): Promise<void>

  setNewPassword(
    trxProvider: TrxProvider,
    passwordResetCode: string,
    newPassword: string,
  ): Promise<void>

  updateByUsername(
    trxProvider: TrxProvider,
    username: string,
    user: Partial<User>,
    acs: ACS,
  ): Promise<void>

  updateSystemStatus(trxProvider: TrxProvider, profile: Profile): Promise<void>
}
