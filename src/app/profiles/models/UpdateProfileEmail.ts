import { Language } from '../../common/Language'

export interface UpdateProfileEmail {
  email: string
  password: string
  username: string
  language?: Language
}
