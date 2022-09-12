import 'dotenv/config'

import * as Knex from 'knex'

import { EnvironmentMode } from '../src/iviche/common/EnvironmentMode'
import { DBConnection } from '../src/iviche/db/DBConnection'
import { TrxUtility } from '../src/iviche/db/TrxUtility'
import { IndexTaskQueueDAOImpl } from '../src/iviche/indexTaskQueue/db/IndexTaskQueueDAOImpl'
import { Action, IndexTask, ReferenceType } from '../src/iviche/indexTaskQueue/model/IndexTask'

const MAX_CHUNK_SIZE = 100
const indexTaskQueueDAO = new IndexTaskQueueDAOImpl()

type UIDs = {
  uid: string
}

export const indexPolls = async (knexConnection: Knex): Promise<void> => {
  let offset = 0
  await TrxUtility.transactional(knexConnection, async trxProvider => {
    let chunk: Array<UIDs>
    do {
      chunk = await knexConnection<UIDs>('poll')
        .select('uid')
        .limit(MAX_CHUNK_SIZE)
        .offset(offset)

      if (!chunk.length) {
        break
      }

      const indexTasks: Array<IndexTask> = chunk.map(poll => ({
        referenceUID: poll.uid,
        referenceType: ReferenceType.POLL,
        action: Action.INDEX,
      }))

      await indexTaskQueueDAO.createMany(trxProvider, indexTasks)

      offset += MAX_CHUNK_SIZE
    } while (chunk.length)
  })

  knexConnection.destroy()
}

if (!EnvironmentMode.isTest()) {
  const knexConnection = new DBConnection().getConnection()
  indexPolls(knexConnection)
    .then(() => {
      process.exit(0)
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.error('IndexPolls error:', e)
      knexConnection.destroy()
      process.exit(-1)
    })
}
