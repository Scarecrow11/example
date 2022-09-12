import { Language } from '../../../common/Language'
import { GenericEntity } from '../../../generic/model/GenericEntity'

export interface UserAuthForm extends GenericEntity {
  username?: string
  password?: string
  token?: string
  enableEmailNotification?: boolean
  deviceToken?: string
  language?: Language
}
