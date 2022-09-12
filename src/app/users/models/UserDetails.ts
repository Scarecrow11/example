import { Language } from '../../common/Language'
import { GenericEntity } from '../../generic/model/GenericEntity'

export interface UserDetails extends GenericEntity {
  googleId?: string
  facebookId?: string
  wpJournalistID?: number
  emailConfirmed?: boolean
  phoneConfirmed?: boolean
  linkFacebook?: string
  linkGoogle?: string
  linkSite?: string
  newsPreferences?: JSON
  passwordRestorationCode?: string
  passwordRestorationCodeCreatedAt?: Date
  createdAt?: Date
  new?: boolean
  language?: Language
}
