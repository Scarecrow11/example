import { Request } from 'express'

import { ModelConstructor } from '../../common/ModelConstructor'
import { ConstructFrom, SingleFieldObject } from '../model/ConstructSingleFieldObject'

export class SingleFieldObjectConstructor
  implements ModelConstructor<SingleFieldObject, SingleFieldObject> {
  constructor(private field: string, private from: ConstructFrom) {}

  public constructRawForm(req: Request): SingleFieldObject {
    return {
      [this.field]: req[this.from][this.field],
    }
  }

  public constructPureObject(req: Request): SingleFieldObject {
    return this.constructRawForm(req)
  }
}
