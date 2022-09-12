import { List } from 'immutable'

import { PaginationMetadata } from './PaginationMetadata'

export interface PagedList<T> {
  readonly metadata: PaginationMetadata
  readonly list: List<T>
}
