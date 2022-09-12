import * as Knex from 'knex'

import { TrxUtility } from '../../db/TrxUtility'
import { logger } from '../../logger/LoggerFactory'
import { ACS } from '../../security/acs/models/ACS'
import { GenericDAO } from '../dao/GenericDAO'
import { EntityFilter } from '../model/EntityFilter'
import { GenericEntity } from '../model/GenericEntity'
import { PagedList } from '../model/PagedList'
import { GenericService } from './GenericService'

export abstract class GenericServiceImpl<
  Entity extends GenericEntity,
  DAO extends GenericDAO<Entity>
> implements GenericService<Entity> {
  constructor(protected dao: DAO, protected db: Knex) {}

  public async get(uid: string, acs: ACS): Promise<Entity | undefined> {
    logger.debug('generic.service.get.start')
    return TrxUtility.transactional<Entity | undefined>(this.db, async trxProvider => {
      const entity = await this.dao.get(trxProvider, uid, acs)
      logger.debug('generic.service.get.done')
      return entity
    })
  }

  public async save(entity: Entity, acs: ACS): Promise<string> {
    logger.debug('generic.service.save.start')
    return TrxUtility.transactional<string>(this.db, async trxProvider => {
      const uid = await this.dao.saveOrUpdate(trxProvider, entity, acs)
      logger.debug('generic.service.save.done')
      return uid
    })
  }

  public async delete(uid: string, acs: ACS): Promise<void> {
    logger.debug('generic.service.delete.start')
    return TrxUtility.transactional<void>(this.db, async trxProvider => {
      const deletion = await this.dao.delete(trxProvider, uid, acs)
      logger.debug('generic.service.delete.done')
      return deletion
    })
  }

  public async list(filter: EntityFilter, acs: ACS): Promise<PagedList<Entity>> {
    logger.debug('generic.service.list.start')
    return TrxUtility.transactional<PagedList<Entity>>(this.db, async trxProvider => {
      const list = await this.dao.list(trxProvider, filter, acs)
      logger.debug('generic.service.list.done')
      return list
    })
  }
}
