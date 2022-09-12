import { Request } from 'express'

import { ModelConstructor } from '../../common/ModelConstructor'
import { EntityFilter } from '../../generic/model/EntityFilter'

export class FilterModelConstructor implements ModelConstructor<EntityFilter, EntityFilter> {
  public constructPureObject(req: Request): EntityFilter {
    const limit = +req.query.limit || 100
    const offset = +req.query.offset || 0
    const orderBy = req.query.orderBy

    if (orderBy) {
      return {
        limit,
        offset,
        order: {
          asc: req.query.asc === 'false' ? false : true,
          orderBy,
        },
      }
    }

    return { limit, offset }
  }

  public constructRawForm(req: Request): EntityFilter {
    return this.constructPureObject(req)
  }
}
