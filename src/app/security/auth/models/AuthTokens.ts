import { RefreshToken } from './RefreshToken'

export interface AuthTokens {
  authToken: string
  refreshToken: RefreshToken
  isNew?: boolean
}
