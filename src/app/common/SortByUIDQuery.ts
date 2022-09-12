import { QueryBuilder } from 'knex'

export const sortByUIDQuery = (
  query: QueryBuilder,
  UIDs: Array<string> = [],
  entity: string,
): void => {
  query.orderByRaw(
    `array_positions(ARRAY[${UIDs?.map(item => `'${item}'`).join(',')}]::uuid[], ${entity})`,
  )
}
