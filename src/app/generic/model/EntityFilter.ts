import { EntityOrder } from './EntitySort'

export interface EntityFilter {
  readonly order?: EntityOrder
  readonly limit: number
  readonly offset: number
}
