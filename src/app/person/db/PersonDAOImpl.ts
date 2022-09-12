import { List } from 'immutable'
import uuidv4 from 'uuid/v4'

import { Gender } from '../../common/Gender'
import { DateUtility } from '../../common/utils/DateUtility'
import { TrxProvider } from '../../db/TrxProvider'
import { checkDAOResult } from '../../generic/dao/ErrorsDAO'
import { EntityFilter } from '../../generic/model/EntityFilter'
import { PagedList } from '../../generic/model/PagedList'
import { PaginationMetadata } from '../../generic/model/PaginationMetadata'
import { PaginationUtility } from '../../generic/utils/PaginationUtility'
import { logger } from '../../logger/LoggerFactory'
import { ACS } from '../../security/acs/models/ACS'
import { Person } from '../model/Person'
import { PersonDAO } from './PersonDAO'

export class PersonDAOImpl implements PersonDAO {
  public async saveOrUpdate(trxProvider: TrxProvider, entity: Person, acs: ACS): Promise<string> {
    logger.debug('person.dao.save-or-update')
    if (entity.uid) {
      await this.update(trxProvider, entity, acs)
      return entity.uid
    } else {
      return this.create(trxProvider, entity)
    }
  }

  private async create(trxProvider: TrxProvider, person: Person): Promise<string> {
    logger.debug('person.dao.create.start')
    const uid = uuidv4()

    const trx = await trxProvider()
    await trx('person').insert({
      uid: uid,
      firstName: person.firstName,
      middleName: person.middleName,
      lastName: person.lastName,
      jobTitle: person.jobTitle,
      legalName: person.legalName,
      shortName: person.shortName,
      tagline: person.tagline,
      email: person.email,
      phone: person.phone,
      birthdayAt: person.birthdayAt,
      gender: person.gender,
      bio: person.bio,
      avatar: person.avatar,
      createdAt: DateUtility.now(),
    })
    logger.debug('person.dao.create.done')
    return uid
  }

  private async update(trxProvider: TrxProvider, person: Person, acs: ACS): Promise<void> {
    logger.debug('person.dao.update.start')
    const trx = await trxProvider()
    const queryBuilder = trx('person')
      .where({ uid: person.uid })
      .update({
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        jobTitle: person.jobTitle,
        legalName: person.legalName,
        shortName: person.shortName,
        tagline: person.tagline,
        email: person.email,
        phone: person.phone,
        birthdayAt: person.birthdayAt,
        gender: person.gender,
        bio: person.bio,
      })
    if (!acs.fullAccess) {
      queryBuilder.whereIn('uid', function() {
        return this.from('users')
          .select('personUID')
          .where(acs.toSQL('uid'))
      })
    }

    const result = await queryBuilder

    checkDAOResult(result, 'person', 'update')
    logger.debug('person.dao.update.done')
  }

  public async get(trxProvider: TrxProvider, uid: string, acs: ACS): Promise<Person | undefined> {
    logger.debug('person.dao.get.start')
    const trx = await trxProvider()
    const queryBuilder = trx<Person | undefined>('person')
      .select('*')
      .where('uid', uid)
      .whereNull('deletedAt')

    if (!acs.fullAccess) {
      queryBuilder.whereIn('uid', function() {
        return this.from('users')
          .select('personUID')
          .where(acs.toSQL('uid'))
          .whereNull('deletedAt')
      })
    }

    logger.debug('person.dao.get.done')
    return queryBuilder.first()
  }

  public async delete(trxProvider: TrxProvider, uid: string): Promise<void> {
    logger.debug('person.dao.delete.start')
    const trx = await trxProvider()

    const result = await trx('person')
      .where({ uid: uid })
      .update({
        avatar: null,
        isLegalPerson: false,
        isPublicPerson: false,
        firstName: '',
        middleName: '',
        lastName: '',
        jobTitle: '',
        legalName: '',
        shortName: '',
        tagline: '',
        phone: '',
        birthdayAt: null,
        gender: Gender.UNSET,
        bio: '',
        addressDistrict: '',
        addressTown: '',
        deletedAt: DateUtility.now(),
      })

    checkDAOResult(result, 'person', 'delete')
    logger.debug('person.dao.delete.done')
  }

  public async list(
    trxProvider: TrxProvider,
    filter: EntityFilter,
    acs: ACS,
  ): Promise<PagedList<Person>> {
    logger.debug('person.dao.list.start')
    const trx = await trxProvider()

    const mainQuery = trx<Person>('person')
      .where(acs.toSQL('uid'))
      .whereNull('deletedAt')

    const pageMetadata: PaginationMetadata = await PaginationUtility.calculatePaginationMetadata(
      mainQuery,
      filter,
    )
    logger.debug('person.dao.list.counted')

    const persons = await PaginationUtility.applyPaginationForQuery(mainQuery, filter).select('*')

    logger.debug('person.dao.list.done')
    return {
      metadata: pageMetadata,
      list: List(persons),
    }
  }

  public async updateByUsername(
    trxProvider: TrxProvider,
    username: string,
    person: Person,
    acs: ACS,
  ): Promise<void> {
    logger.debug('person.dao.update-by-username.start')
    const trx = await trxProvider()
    const queryBuilder = trx('person')
      .whereIn(
        'uid',
        trx('users')
          .select('personUID')
          .where('username', username)
          .first(),
      )
      .update({
        avatar: person.avatar,
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        jobTitle: person.jobTitle,
        legalName: person.legalName,
        shortName: person.shortName,
        tagline: person.tagline,
        birthdayAt: person.birthdayAt,
        gender: person.gender,
        bio: person.bio,
      })
    if (!acs.fullAccess) {
      queryBuilder.whereIn('uid', function() {
        return this.from('users')
          .select('personUID')
          .where(acs.toSQL('uid'))
      })
    }

    const result = await queryBuilder
    checkDAOResult(result, 'person', 'update-by-username')
    logger.debug('person.dao.update-by-username.done')
  }

  public async updateEmail(trxProvider: TrxProvider, email: string, acs: ACS): Promise<void> {
    logger.debug('person.dao.update-email.start')
    const trx = await trxProvider()
    const result = await trx('person')
      .whereIn('uid', function() {
        return this.from('users')
          .select('personUID')
          .where(acs.toSQL('uid'))
      })
      .update({ email })

    checkDAOResult(result, 'person', 'update-email')
    logger.debug('person.dao.update-email.done')
  }

  public async updatePhone(trxProvider: TrxProvider, phone: string, acs: ACS): Promise<void> {
    logger.debug('person.dao.update-phone.start')
    const trx = await trxProvider()
    const result = await trx('person')
      .whereIn('uid', function() {
        return this.from('users')
          .select('personUID')
          .where(acs.toSQL('uid'))
      })
      .update({ phone })

    checkDAOResult(result, 'person', 'update-phone')
    logger.debug('person.dao.update-phone.done')
  }

  public async getByUserUID(trxProvider: TrxProvider, userUID: string): Promise<Person> {
    logger.debug('person.dao.get-by-user-uid.start')
    const trx = await trxProvider()
    const person = await trx<Person>('users')
      .select('person.*')
      .where('users.uid', '=', userUID)
      .innerJoin('person', 'users.personUID', 'person.uid')
      .first()

    logger.debug('person.dao.get-by-user-uid.done')
    return person
  }

  public async getByEmail(trxProvider: TrxProvider, email: string): Promise<Person | undefined> {
    logger.debug('person.dao.get-by-email.start')
    const trx = await trxProvider()
    const person = await trx<Person | undefined>('person')
      .select('*')
      .where('email', email)
      .whereNull('deletedAt')
      .first()

    logger.debug('person.dao.get-by-email.done')
    return person
  }
}
