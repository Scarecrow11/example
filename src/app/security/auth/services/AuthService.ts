import { Language } from '../../../common/Language'
import { Profile } from '../../../profiles/models/Profile'
import { User } from '../../../users/models/User'
import { AuthTokens } from '../models/AuthTokens'
import { HeaderInfo } from '../models/HeaderInfo'

export interface AuthService {
  registerUser(profile: Profile, language?: Language): Promise<void>

  login(
    username: string,
    password: string,
    headerInfo: HeaderInfo,
    deviceToken?: string,
  ): Promise<AuthTokens>

  validateAccessToken(authToken: string): Promise<User>

  refreshAuthTokens(refreshTokenJWT: string, headerInfo: HeaderInfo): Promise<AuthTokens>

  loginGoogle(
    token: string,
    headerInfo: HeaderInfo,
    language: Language,
    deviceToken?: string,
  ): Promise<AuthTokens>

  loginFacebook(
    token: string,
    headerInfo: HeaderInfo,
    language: Language,
    deviceToken?: string,
  ): Promise<AuthTokens>

  verifyUsernamePassword(
    username: string,
    password: string,
    user: User | undefined,
    source: string,
  ): Promise<void>
}
