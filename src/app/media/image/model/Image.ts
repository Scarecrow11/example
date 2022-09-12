import { GenericEntity } from '../../../generic/model/GenericEntity'

export enum ImageEntity {
  person = 'person',
  news = 'news',
}

export interface Image extends GenericEntity {
  originalName?: string
  entity?: ImageEntity
  isPublic?: boolean
  mimeType?: string
  data?: Uint8Array
  ownerUID?: string
  createdAt?: Date
}
