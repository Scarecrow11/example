import Busboy from 'busboy'
import { Request, Response, Router } from 'express'
import { inject, injectable } from 'tsyringe'

import { validate } from '../../../../common/validators/ValidationMiddleware'
import { NotFoundErrorCodes } from '../../../../error/DetailErrorCodes'
import { ServerError } from '../../../../error/ServerError'
import { logger } from '../../../../logger/LoggerFactory'
import { Image, ImageEntity } from '../../../../media/image/model/Image'
import { ImageStorage } from '../../../../media/image/service/ImageStorage'
import { ImageValidator } from '../../../../media/image/validator/ImageValidator'
import { verifyAccess } from '../../../../security/acs/ACSMiddleware'
import { AuthProvider } from '../../../../security/auth/services/AuthProvider'
import { UserService } from '../../../../users/services/UserService'
import { Controller } from '../../Controller'
import { ImageModelConstructor } from './ImageModelConstructor'

@injectable()
export class ImageController implements Controller {
  private MAX_FILE_SIZE = 10 * 1024 * 1024
  private modelConstructor = new ImageModelConstructor()
  private validator = new ImageValidator()

  constructor(
    @inject('ImageStorage') private imageStorage: ImageStorage,
    @inject('UserService') private userService: UserService,
    @inject('AuthProvider') private authProvider: AuthProvider,
  ) {}

  public path(): string {
    return '/images'
  }

  public initialize(router: Router): void {
    router.post(
      '/',
      verifyAccess('save_image'),
      validate(this.modelConstructor, this.validator),
      this.save,
    )
    router.get('/:uid', this.get)
  }

  public save = async (request: Request, response: Response): Promise<void> => {
    logger.debug('image.controller.save.start')
    const userUID = await this.getUserUID(request)
    const isPublic = request.query.public || false

    const busboy = new Busboy({
      headers: request.headers,
      limits: { files: 1, fileSize: this.MAX_FILE_SIZE },
    })
    request.pipe(busboy)
    const image = await this.imageStorage.save(busboy, userUID, ImageEntity.person, isPublic)
    response.json({ uid: image.uid })
    logger.debug('image.controller.save.done')
  }

  public get = async (request: Request, response: Response): Promise<void> => {
    logger.debug('image.controller.get.start')
    const { uid } = request.params
    const { token } = request.cookies
    const authTokenData = token && this.authProvider.decodeAuthToken(token)
    const image = (await this.imageStorage.get(
      uid,
      authTokenData && authTokenData.userUID,
    )) as Image

    response.writeHead(200, {
      'Content-Type': image.mimeType,
    })
    response.end(image.data)
    logger.debug('image.controller.get.done')
  }

  private getUserUID = async (request: Request): Promise<string> => {
    const email = request.query.email

    if (email) {
      const user = await this.userService.findUser(email)

      if (!user || !user.uid) {
        logger.error('image.controller.save-as.error.not-found')
        throw new ServerError(
          'User not found',
          404,
          NotFoundErrorCodes.IMAGE_NOT_FOUND_ERROR,
          'image',
        )
      }

      return user.uid
    }

    const userUID = request.user && request.user.uid
    return userUID
  }
}
