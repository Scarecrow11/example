import axios, { AxiosResponse } from 'axios'
import { createHash } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { LoginTicket, TokenPayload } from 'google-auth-library/build/src/auth/loginticket'
import jwt from 'jsonwebtoken'
import uuidv4 from 'uuid/v4'

import { ApplicationError } from '../../../error/ApplicationError'
import { AuthErrorCodes } from '../../../error/DetailErrorCodes'
import { ServerError } from '../../../error/ServerError'
import { logger } from '../../../logger/LoggerFactory'
import { FacebookData } from '../models/FacebookData'
import { HeaderInfo } from '../models/HeaderInfo'
import { JwtObject } from '../models/JwtObject'
import { RefreshToken } from '../models/RefreshToken'
import { AuthProvider } from './AuthProvider'

export class AuthProviderImpl implements AuthProvider {
  private TOKEN_TYPE = 'jwt'
  private TOKEN_EXPIRATION_TIME = 1800 // 30 min in UNIX
  private readonly DEFAULT_JWT_SECRET = 'secret-salt'
  private readonly jwtSecret: string
  private readonly HASHING_ALGORITHM = 'sha512'
  private readonly HASH_ENCODING = 'base64'
  private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string
  private readonly googleClient = new OAuth2Client(this.GOOGLE_CLIENT_ID)
  private readonly FB_GET_PROFILE_URL = `https://graph.facebook.com/v5.0/me`

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET) {
        throw new ApplicationError('JWT_SECRET is not configured')
      }

      this.jwtSecret = process.env.JWT_SECRET as string
    } else {
      this.jwtSecret = this.DEFAULT_JWT_SECRET
    }
  }

  public getRefreshTokenHash(uuid: string, headerInfo: HeaderInfo): string {
    const { userAgent } = headerInfo
    const footPrint = userAgent.browser.name + headerInfo.ip + userAgent.os.name
    return createHash(this.HASHING_ALGORITHM)
      .update(uuid + footPrint)
      .digest(this.HASH_ENCODING)
  }

  public getAuthToken(userUID: string): string {
    const jwtData = this.generateJWT({ userUID }, this.jwtSecret, this.TOKEN_EXPIRATION_TIME)
    return `${this.TOKEN_TYPE} ${jwtData}`
  }

  public getRefreshToken(headerInfo: HeaderInfo): RefreshToken {
    const uuid = uuidv4()
    const hash = this.getRefreshTokenHash(uuid, headerInfo)
    return { token: uuid, hash }
  }

  public decodeAuthToken(token: string): JwtObject {
    logger.debug('auth-provider.decode-auth-token.start.decode-token')
    const jwtToken = this.extractJwtFromAuthToken(token)
    try {
      logger.debug('auth-provider.decode-auth-token.done.decode-token')
      return this.decodeJWT(jwtToken, this.jwtSecret)
    } catch (e) {
      logger.debug('auth-provider.decode-auth-token.error.decode-token')
      if (e.name === 'TokenExpiredError') {
        throw new ServerError('jwt expired', 401, AuthErrorCodes.JWT_EXPIRED, 'token')
      }
      if (e.name === 'JsonWebTokenError') {
        throw new ServerError('invalid signature', 401, AuthErrorCodes.INVALID_SIGNATURE, 'token')
      }
      throw new ServerError(e.message, 401)
    }
  }

  public async decodeGoogleToken(token: string): Promise<TokenPayload> {
    const tokenData = await this.verifyGoogleToken(token)
    return this.getGoogleTokenPayload(tokenData)
  }

  private async verifyGoogleToken(token: string): Promise<LoginTicket> {
    logger.debug('auth-provider.decode-google-token.start.decode-token')
    try {
      const decodedToken = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.GOOGLE_CLIENT_ID,
      })
      logger.debug('auth-provider.decode-google-token.done.decode-token')
      return decodedToken
    } catch (e) {
      logger.debug('auth-provider.decode-google-token.error.decode-token')
      throw new ServerError('Failed to login via google', 401)
    }
  }

  private getGoogleTokenPayload(tokenData: LoginTicket): TokenPayload {
    logger.debug('auth-provider.decode-google-token.start.retrieve-token-data')
    const tokenPayload = tokenData.getPayload()
    if (!tokenPayload) {
      logger.debug('auth-provider.decode-google-token.error.retrieve-token-data')
      throw new ServerError('Failed to login via google. No payload', 401)
    }
    logger.debug('auth-provider.decode-google-token.done.retrieve-token-data')
    return tokenPayload
  }

  public async decodeFacebookToken(token: string): Promise<FacebookData> {
    logger.debug('auth.provider.get-fb-profile.start')

    try {
      const response: AxiosResponse = await axios.get(this.FB_GET_PROFILE_URL, {
        params: {
          fields: 'id,email,birthday,location,first_name,last_name,gender',
          access_token: token, // eslint-disable-line @typescript-eslint/camelcase
        },
      })
      logger.debug('auth.provider.get-fb-profile.done')
      return response.data
    } catch (error) {
      logger.debug('auth.provider.get-fb-profile.error', error)
      throw new ServerError('Failed to login via facebook', 401)
    }
  }

  private extractJwtFromAuthToken(authHeader: string | undefined): string {
    logger.debug('auth.provider.extract-jwt-from-auth-token.start')
    if (!authHeader) {
      logger.debug('auth.provider.extract-jwt-from-auth-token.error.no-auth-token')
      throw new ServerError('No auth token', 401)
    }
    const [prefixFromToken, token] = authHeader.split(' ')

    if (!token || prefixFromToken !== this.TOKEN_TYPE) {
      logger.debug('auth.provider.extract-jwt-from-auth-token.error.incorrect-access-token')
      throw new ServerError('Incorrect access token', 401)
    }
    logger.debug('auth.provider.extract-jwt-from-auth-token.done')
    return token
  }

  private generateJWT(data: string | Buffer | object, secret: string, expiresIn?: number): string {
    logger.debug('auth.provider.generate-jwt.start')
    const options = expiresIn ? { expiresIn } : {}
    const jwtToken = jwt.sign(
      data,
      Buffer.alloc(secret.length, secret, this.HASH_ENCODING),
      options,
    )
    logger.debug('auth.provider.generate-jwt.done')
    return jwtToken
  }

  private decodeJWT(token: string, secret: string): JwtObject {
    logger.debug('auth.provider.decode-jwt.start')
    const data = jwt.verify(
      token,
      Buffer.alloc(secret.length, secret, this.HASH_ENCODING),
    ) as JwtObject
    logger.debug('auth.provider.decode-jwt.done')
    return data
  }
}
