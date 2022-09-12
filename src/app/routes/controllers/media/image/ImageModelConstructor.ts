import { Request } from 'express'

import { ModelConstructor } from '../../../../common/ModelConstructor'
import { Image } from '../../../../media/image/model/Image'

export class ImageModelConstructor implements ModelConstructor<Image, Image> {
  public constructRawForm(req: Request): Image {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): Image {
    return {
      isPublic: req.query.public,
    }
  }
}
