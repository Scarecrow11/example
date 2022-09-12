import * as Knex from 'knex'

export type TrxProvider = () => Promise<Knex.Transaction>
