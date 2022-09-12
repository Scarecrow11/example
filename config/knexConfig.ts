import 'dotenv/config'

import { logger } from '../src/iviche/logger/LoggerFactory'

const poolHealth = {
  MIN_CONNECTIONS_NUMBER: 2,
  WARNING_CONNECTIONS_NUMBER: 7,
  MAX_CONNECTIONS_NUMBER: 10,
  currentConnections: 0,
}

export const config = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: +(process.env.DB_PORT || 5432),
    },
    migrations: {
      directory: __dirname + '/../database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: __dirname + '/../database/seeds',
    },
    log: {},
  },

  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST_I9N,
      user: process.env.DB_USER_I9N || 'postgres',
      password: process.env.DB_PASSWORD_I9N || 'pass4test',
      database: process.env.DB_NAME_I9N || 'iviche_voting_test',
      port: +(process.env.DB_PORT_I9N || 2345),
    },
    migrations: {
      directory: __dirname + '/../database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: __dirname + '/../test/database/seeds',
    },
    log: {},

    pool: {
      min: poolHealth.MIN_CONNECTIONS_NUMBER,
      max: poolHealth.MAX_CONNECTIONS_NUMBER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      afterCreate: (conn: any, done: any): void => {
        poolHealth.currentConnections += 1
        if (poolHealth.currentConnections > poolHealth.WARNING_CONNECTIONS_NUMBER) {
          logger.warn('knex.connection.active:', { message: poolHealth.currentConnections })
        } else if (poolHealth.currentConnections >= poolHealth.MAX_CONNECTIONS_NUMBER) {
          logger.error('knex.connection.active.critical:', {
            message: poolHealth.currentConnections,
          })
          process.exit(-1)
        }
        done(null, conn)
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      destroy: (conn: any, done: any): void => {
        poolHealth.currentConnections -= 1
        done(null, conn)
      },
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: +(process.env.DB_PORT || 5432),
      ssl: true,
    },
    pool: {
      min: poolHealth.MIN_CONNECTIONS_NUMBER,
      max: poolHealth.MAX_CONNECTIONS_NUMBER,
    },
    migrations: {
      directory: __dirname + '/../database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: __dirname + '/../database/seeds',
    },
    log: {},
  },
}
