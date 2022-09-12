import axios from 'axios'
import Jimp from 'jimp'
import * as streams from 'stream'
import { inject, injectable } from 'tsyringe'
import uuidv4 from 'uuid/v4'

import { NotFoundErrorCodes, ValidationErrorCodes } from '../../../error/DetailErrorCodes'
import { ServerError } from '../../../error/ServerError'
import { logger } from '../../../logger/LoggerFactory'
import { FileType } from '../../FileType'
import { ImageStorageDao } from '../db/ImageStorageDao'
import { Image, ImageEntity } from '../model/Image'
import { ImageSize } from '../model/ImageSize'
import { ImageStorage } from './ImageStorage'

@injectable()
export class ImageStorageImpl implements ImageStorage {
  constructor(@inject('ImageStorageDao') private dao: ImageStorageDao) {}

  public save(
    stream: streams.Writable,
    userUID: string,
    entity: ImageEntity = ImageEntity.person,
    isPublic: boolean,
  ): Promise<Image> {
    logger.debug('image.storage.save.start')

    return new Promise((resolve, reject): void => {
      let buffer = Buffer.alloc(0)
      let isFileExist = false
      stream.on('file', (fieldName, file, fileName) => {
        isFileExist = true
        file.on('limit', () => {
          stream.destroy()
          logger.debug('image.storage.save.error.size')
          reject(
            new ServerError(
              'File size has been exceeded',
              400,
              ValidationErrorCodes.FILE_SIZE_MAX_ERROR,
              'image',
            ),
          )
        })
        file.on('data', function(data: ArrayBuffer) {
          const chunk = Buffer.from(data)
          buffer = Buffer.concat([buffer, chunk])
        })
        file.on('end', async () => {
          const fileType = new FileType(buffer)
          if (!fileType.isAllowedImageType()) {
            stream.destroy()
            logger.debug('image.storage.save.error.type')
            reject(
              new ServerError(
                'Forbidden image type',
                400,
                ValidationErrorCodes.FILE_TYPE_ERROR,
                'image',
              ),
            )
            return
          }
          try {
            const { width, height } = ImageSize[entity]
            const resizedImage = await this.resizeImage(
              buffer,
              width,
              height,
              fileType.getMimeType(),
            )
            const uuid = uuidv4()

            const image: Image = {
              uid: uuid,
              entity: entity as ImageEntity,
              originalName: fileName,
              isPublic,
              data: Uint8Array.from(resizedImage),
              mimeType: fileType.getMimeType(),
              ownerUID: userUID,
            }
            await this.dao.save(image)
            resolve(image)
            logger.debug('image.storage.save.done')
          } catch (e) {
            logger.debug('image.storage.save.error.unknown')
            reject(e)
          }
        })
      })
      stream.on('finish', () => {
        if (!isFileExist) {
          logger.debug('image.storage.save.error.no-file')
          reject(
            new ServerError(
              'No files to upload',
              400,
              ValidationErrorCodes.FIELD_REQUIRED_VALIDATION_ERROR,
              'image',
            ),
          )
        }
      })
    })
  }

  public async get<Image>(uid: string, ownerUID?: string): Promise<Image> {
    logger.debug('image.storage.get.start')

    const image = (await this.dao.get(uid, ownerUID)) as Image
    if (!image) {
      logger.debug('image.storage.get.error.not-found')
      throw new ServerError('Not found', 404, NotFoundErrorCodes.IMAGE_NOT_FOUND_ERROR, 'image')
    }
    logger.debug('image.storage.get.done')
    return image
  }

  public async saveFromUrl(
    url: string,
    ownerUID: string,
    entity: ImageEntity = ImageEntity.news,
  ): Promise<string> {
    logger.debug('image.storage.save-from-url.start')
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, 'binary')
    const uuid = uuidv4()
    const fileType = new FileType(buffer)
    const { width, height } = ImageSize[entity]
    const resizedImage = await this.resizeImage(buffer, width, height, fileType.getMimeType())

    const image: Image = {
      uid: uuid,
      entity: entity as ImageEntity,
      originalName: `wpi-${new Date().getTime()}`,
      isPublic: true,
      data: Uint8Array.from(resizedImage),
      mimeType: fileType.getMimeType(),
      ownerUID,
    }

    await this.dao.save(image)

    logger.debug('image.storage.save-from-url.done')
    return uuid
  }

  private async resizeImage(
    buffer: Buffer,
    width: number,
    height: number,
    mimeType: string,
  ): Promise<Buffer> {
    const image = await Jimp.read(buffer)
    image.scaleToFit(width, height)
    return image.getBufferAsync(mimeType)
  }
}
