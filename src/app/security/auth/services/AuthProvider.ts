import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket'

import { FacebookData } from '../models/FacebookData'
import { HeaderInfo } from '../models/HeaderInfo'
import { JwtObject } from '../models/JwtObject'
import { RefreshToken } from '../models/RefreshToken'

export interface AuthProvider {
  getRefreshTokenHash(uuid: string, headerInfo: HeaderInfo): string

  getAuthToken(userUID: string): string

  getRefreshToken(headerInfo: HeaderInfo): RefreshToken

  decodeAuthToken(token: string): JwtObject

  decodeGoogleToken(token: string): Promise<TokenPayload>

  decodeFacebookToken(token: string): Promise<FacebookData>
}
