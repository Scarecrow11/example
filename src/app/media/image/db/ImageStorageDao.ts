import { Image } from '../model/Image'

export interface ImageStorageDao {
  save(image: Image): Promise<void>

  get(uid: string, ownerUID?: string): Promise<Image>
}
