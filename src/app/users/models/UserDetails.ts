import { Language } from '../../common/Language'
import { GenericEntity } from '../../generic/model/GenericEntity'

export interface UserDetails extends GenericEntity {
  emailConfirmed?: boolean
  passwordRestorationCode?: string
  passwordRestorationCodeCreatedAt?: Date
  createdAt?: Date
  new?: boolean
  language?: Language
}
