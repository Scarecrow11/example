import { Storage } from '../../Storage'
import { ImageEntity } from '../model/Image'

export interface ImageStorage extends Storage {
  saveFromUrl(url: string, ownerUID: string, entity?: ImageEntity): Promise<string>
}
