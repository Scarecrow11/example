import { TrxProvider } from '../../db/TrxProvider'
import { ACS } from '../../security/acs/models/ACS'
import { EntityFilter } from '../model/EntityFilter'
import { GenericEntity } from '../model/GenericEntity'
import { PagedList } from '../model/PagedList'

export interface GenericDAO<T extends GenericEntity> {
  get(trxProvider: TrxProvider, uid: string, acs: ACS): Promise<T | undefined>

  saveOrUpdate(trxProvider: TrxProvider, entity: T, acs: ACS): Promise<string>

  delete(trxProvider: TrxProvider, uid: string, acs: ACS): Promise<void>

  list(trxProvider: TrxProvider, filter: EntityFilter, acs: ACS): Promise<PagedList<T>>
}
