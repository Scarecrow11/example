import * as Knex from 'knex'
import { inject, injectable } from 'tsyringe'

import { TrxUtility } from '../../db/TrxUtility'
import { GenericServiceImpl } from '../../generic/service/GenericServiceImpl'
import { logger } from '../../logger/LoggerFactory'
import { PersonDAO } from '../db/PersonDAO'
import { Person } from '../model/Person'
import { PersonService } from './PersonService'

@injectable()
export class PersonServiceImpl extends GenericServiceImpl<Person, PersonDAO>
  implements PersonService {
  constructor(@inject('PersonDAO') dao: PersonDAO, @inject('DBConnection') db: Knex) {
    super(dao, db)
  }
  public async getByUserUID(userUID: string): Promise<Person | undefined> {
    logger.debug('person.service.get-by-user-uid.start')
    return TrxUtility.transactional<Person | undefined>(this.db, async trxProvider => {
      const person = await this.dao.getByUserUID(trxProvider, userUID)
      logger.debug('person.service.get-by-user-uid.done')
      return person
    })
  }

  public async getByEmail(email: string): Promise<Person | undefined> {
    logger.debug('person.service.get-by-email.start')
    return TrxUtility.transactional<Person | undefined>(this.db, async trxProvider => {
      const person = await this.dao.getByEmail(trxProvider, email)
      logger.debug('person.service.get-by-email.done')
      return person
    })
  }
}
