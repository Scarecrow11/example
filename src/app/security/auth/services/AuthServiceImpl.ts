import { createHash } from 'crypto'
import Knex from 'knex'
import { inject, injectable } from 'tsyringe'

import { EnvironmentMode } from '../../../common/EnvironmentMode'
import { Language } from '../../../common/Language'
import { DateUtility } from '../../../common/utils/DateUtility'
import { TrxUtility } from '../../../db/TrxUtility'
import { ApplicationError } from '../../../error/ApplicationError'
import {
  AuthErrorCodes,
  ConflictErrorCodes,
  ForbiddenErrorCodes,
} from '../../../error/DetailErrorCodes'
import { ServerError } from '../../../error/ServerError'
import { logger } from '../../../logger/LoggerFactory'
import { EmailService } from '../../../mailer/EmailService'
import { Profile } from '../../../profiles/models/Profile'
import { ProfileService } from '../../../profiles/services/ProfileService'
import { ProfileModelConstructor } from '../../../routes/controllers/profiles/ProfileModelConstructor'
import { User } from '../../../users/models/User'
import { UserSystemStatus } from '../../../users/models/UserSystemStatus'
import { UserService } from '../../../users/services/UserService'
import { GrandAccessACS } from '../../acs/strategies'
import { AuthDAO } from '../db/AuthDAO'
import { AuthTokens } from '../models/AuthTokens'
import { HeaderInfo } from '../models/HeaderInfo'
import { AuthProvider } from './AuthProvider'
import { AuthService } from './AuthService'

@injectable()
export class AuthServiceImpl implements AuthService {
  public static encryptPassword(password: string): string {
    if (!password) {
      throw new ApplicationError('Password is empty')
    }
    if (EnvironmentMode.isProduction()) {
      return createHash('sha512')
        .update(password)
        .digest('hex')
    }
    return `TEXT:${password}`
  }

  private static getRefreshTokenAgeInDays(createdAt: Date): number {
    return DateUtility.getDateDiff(createdAt, DateUtility.now(), ['days']).days as number
  }

  private readonly REFRESH_TOKEN_EXP_TIME = 60 // 60 days

  private profileModuleConstructor = new ProfileModelConstructor()

  constructor(
    @inject('UserService') private userService: UserService,
    @inject('AuthProvider')
    private authProvider: AuthProvider,
    @inject('ProfileService')
    private profileService: ProfileService,
    @inject('DBConnection') private db: Knex,
    @inject('AuthDAO') private authDao: AuthDAO,
    @inject('EmailService') private emailService: EmailService,
  ) {}

  public async verifyUserSystemStatus(user: User | undefined): Promise<void> {
    logger.debug('auth.service.verify-user-system-status.start.for:', user?.username)

    if (user && user.systemStatus === UserSystemStatus.BANNED) {
      logger.debug('auth.service.verify-username-password.unsuccessful.for:', user.username)
      throw new ServerError('User banned', 403, ForbiddenErrorCodes.USER_BANNED, 'system-status')
    }

    logger.debug('auth.service.verify-user-system-status.done.for:', user?.username)
  }

  public async verifyUsernamePassword(
    username: string,
    password: string,
    user: User | undefined,
    source: string,
  ): Promise<void> {
    logger.debug('auth.service.verify-username-password.start.for:', username)

    if (!user || !(user.password === AuthServiceImpl.encryptPassword(password))) {
      logger.debug('auth.service.verify-username-password.unsuccessful.for:', username)
      throw new ServerError(
        "Username/password don't match",
        401,
        AuthErrorCodes.DONT_MATCH_ERROR,
        source,
      )
    }
    logger.debug('auth.service.verify-username-password.done.for:', username)
  }

  public async registerUser(profile: Profile, language: Language = Language.UA): Promise<void> {
    logger.debug('auth.service.register.start.for:', profile.user.username)

    await this.profileService.create(profile, new GrandAccessACS(), language, true)

    logger.debug(`auth.service.register.done.for:[${profile.user.username}]`)
  }

  public async login(
    username: string,
    password: string,
    headerInfo: HeaderInfo,
    deviceToken?: string,
  ): Promise<AuthTokens> {
    logger.debug('auth.service.login.start.for:', username)

    const user = await this.userService.findByEmail(username)

    await this.verifyUserSystemStatus(user)
    await this.verifyUsernamePassword(username, password, user, 'login')

    logger.debug('auth.service.login.done.for:', username)
    return this.createAuthTokens(user as User, headerInfo, deviceToken)
  }

  public async loginGoogle(
    token: string,
    headerInfo: HeaderInfo,
    language: Language = Language.UA,
    deviceToken?: string,
  ): Promise<AuthTokens> {
    logger.debug('auth.service.login-google.start')
    const tokenPayload = await this.authProvider.decodeGoogleToken(token)

    if (!tokenPayload.email_verified) {
      throw new ServerError(
        `Google email is not verified`,
        403,
        ForbiddenErrorCodes.EMAIL_IS_NOT_CONFIRMED,
        'google',
      )
    }

    let isNew = false
    let user = await this.userService.findByGoogleId(tokenPayload.sub)
    await this.verifyUserSystemStatus(user)

    if (!user) {
      const profile = this.profileModuleConstructor.constructGoogleProfile(
        tokenPayload.email as string,
        tokenPayload.sub,
        tokenPayload.email_verified,
      )

      let userUID
      try {
        userUID = await this.profileService.create(profile, new GrandAccessACS(), language)
      } catch (error) {
        this.processErrorAfterProfileCreation(error, 'google')
      }

      user = { ...profile.user, uid: userUID }
      this.emailService.sendConfirmEmailCodeIfNeeded(profile, language)
      isNew = true
    }

    const tokens = await this.createAuthTokens(user, headerInfo, deviceToken)
    logger.debug('auth.service.login-google.done')
    return { ...tokens, isNew }
  }

  public async loginFacebook(
    token: string,
    headerInfo: HeaderInfo,
    language: Language = Language.UA,
    deviceToken?: string,
  ): Promise<AuthTokens> {
    logger.debug('auth.service.login-facebook.start')
    const tokenPayload = await this.authProvider.decodeFacebookToken(token)

    if (!tokenPayload.email) {
      throw new ServerError(
        `Facebook's email is empty`,
        403,
        ForbiddenErrorCodes.NO_EMAIL_ON_FACEBOOK,
        'facebook',
      )
    }

    const facebookId = tokenPayload.id as string

    let isNew = false
    let user = await this.userService.findByFacebookId(facebookId)
    await this.verifyUserSystemStatus(user)
    if (!user) {
      const profile = this.profileModuleConstructor.constructFacebookProfile(tokenPayload)
      let userUID

      try {
        userUID = await this.profileService.create(profile, new GrandAccessACS(), language)
      } catch (error) {
        this.processErrorAfterProfileCreation(error, 'facebook')
      }

      user = { ...profile.user, uid: userUID }
      isNew = true
    }

    const tokens = await this.createAuthTokens(user, headerInfo, deviceToken)
    logger.debug('auth.service.login-facebook.done')
    return { ...tokens, isNew }
  }

  public async refreshAuthTokens(
    refreshToken: string,
    headerInfo: HeaderInfo,
  ): Promise<AuthTokens> {
    logger.debug('auth.service.refresh.start')

    return TrxUtility.transactional<AuthTokens>(this.db, async trxProvider => {
      const authData = await this.authDao.get(trxProvider, refreshToken)
      const refreshTokenHash = this.authProvider.getRefreshTokenHash(refreshToken, headerInfo)

      if (!authData || authData.refreshTokenHash !== refreshTokenHash) {
        logger.debug('auth.service.refresh.unsuccessful')
        throw new ServerError('Not found', 401, AuthErrorCodes.GOOGLE_VERIFY_ERROR, 'token')
      }
      // NOTE: It could be optimized
      const user = await this.userService.findUser(authData.username)
      const userUID = (user && user.uid) || ''
      const newAuthTokens = this.getTokens(userUID, headerInfo)
      const tokenCreatedAt = authData.createdAt as Date

      await this.authDao.delete(trxProvider, refreshToken)
      if (AuthServiceImpl.getRefreshTokenAgeInDays(tokenCreatedAt) > this.REFRESH_TOKEN_EXP_TIME) {
        ;(await trxProvider()).commit()
        throw new ServerError('RefreshToken has expired', 401)
      }
      await this.authDao.saveRefreshToken(trxProvider, {
        uid: newAuthTokens.refreshToken.token,
        username: authData.username,
        headerInfo: headerInfo,
        refreshTokenHash: newAuthTokens.refreshToken.hash,
      })

      logger.debug('auth.service.refresh.done')
      return newAuthTokens
    })
  }

  public async validateAccessToken(authToken?: string): Promise<User> {
    logger.debug('auth.service.validate-access-token.start')

    if (!authToken) {
      throw new ServerError('No auth token', 401, AuthErrorCodes.NO_ACCESS_TOKEN, 'token')
    }

    const { userUID } = this.authProvider.decodeAuthToken(authToken)

    const user = await this.userService.get(userUID, new GrandAccessACS())

    if (!user) {
      logger.error('auth.service.validate-access-token.error.not-found')
      throw new ServerError('Incorrect access token', 401)
    }
    logger.debug('auth.service.validate-access-token.done')
    return user
  }

  private async createAuthTokens(
    user: User,
    headerInfo: HeaderInfo,
    deviceToken?: string,
  ): Promise<AuthTokens> {
    const { username } = user
    const authTokens = this.getTokens(user.uid as string, headerInfo)

    return TrxUtility.transactional<AuthTokens>(this.db, async trxProvider => {
      logger.debug(`auth.service.login.start.transaction.user:[${username}]`)
      await this.authDao.dropExceedingSessionsIfAny(trxProvider, username)
      deviceToken && (await this.authDao.dropDeviceTokenIfAny(trxProvider, deviceToken))
      await this.authDao.saveRefreshToken(trxProvider, {
        uid: authTokens.refreshToken.token,
        username,
        headerInfo,
        deviceToken,
        refreshTokenHash: authTokens.refreshToken.hash,
      })
      if (user.uid) {
        this.userService.updateUserLastLogin(user.uid)
      }
      logger.debug(`auth.service.login.done.user:[${username}]`)
      return authTokens
    })
  }

  private getTokens(userUID: string, headerInfo: HeaderInfo): AuthTokens {
    logger.debug('auth.service.get-tokens.start')
    const authToken = this.authProvider.getAuthToken(userUID)
    const refreshToken = this.authProvider.getRefreshToken(headerInfo)
    logger.debug('auth.service.get-tokens.done')
    return { authToken, refreshToken }
  }

  private processErrorAfterProfileCreation(error: ServerError, source: string): Promise<void> {
    if (error.code === ConflictErrorCodes.EXIST_ERROR) {
      error.source = source
    }
    throw error
  }
}
