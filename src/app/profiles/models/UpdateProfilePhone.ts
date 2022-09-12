import { Language } from '../../common/Language'

export interface UpdateProfilePhone {
  phone: string
  password: string
  username: string
  language?: Language
}
