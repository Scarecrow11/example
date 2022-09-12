import { oneLine } from 'common-tags'
import * as Knex from 'knex'

import { DBConnection } from '../src/iviche/db/DBConnection'
import { Elastic } from '../src/iviche/elastic/Elastic'

const dropIndexes = async (elastic: Elastic): Promise<void> => {
  await elastic.clearAll()
}

const dropTables = async (knex: Knex): Promise<void> => {
  await knex.raw(oneLine`
    DO $$ DECLARE
      r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;`)
}

export async function cleanup(knex: Knex, elastic: Elastic): Promise<void> {
  const parameter = '--remove-' + process.env.DB_HOST
  if (process.argv.indexOf(parameter) < 0) {
    // eslint-disable-next-line no-console
    console.error(`Please confirm your action by adding parameter [-- ${parameter}]`)
    process.exit(-1)
  } else {
    await dropTables(knex)
    // eslint-disable-next-line no-console
    console.log('Database cleared.')
    await dropIndexes(elastic)
    // eslint-disable-next-line no-console
    console.log('Elasticsearch cleared.')
  }
}

cleanup(new DBConnection().getConnection(), new Elastic())
  .then(() => {
    process.exit(0)
  })
  .catch(e => {
    // eslint-disable-next-line no-console
    console.error('Cleanup error:', e)
    process.exit(-1)
  })
