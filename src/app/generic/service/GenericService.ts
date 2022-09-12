import { ACS } from '../../security/acs/models/ACS'
import { EntityFilter } from '../model/EntityFilter'
import { GenericEntity } from '../model/GenericEntity'
import { PagedList } from '../model/PagedList'

export interface GenericService<Entity extends GenericEntity> {
  get(uid: string, acs: ACS): Promise<Entity | undefined>

  save(entity: Entity, acs: ACS): Promise<string>

  delete(uid: string, acs: ACS): Promise<void>

  list(filter: EntityFilter, acs: ACS): Promise<PagedList<Entity>>
}
