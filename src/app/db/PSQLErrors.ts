import { NotFoundErrorCodes } from '../error/DetailErrorCodes'

export const errorCodes = [
  {
    code: '42703',
    message: 'Field for sort not found',
    resCode: 404,
    detailCode: NotFoundErrorCodes.ORDER_FIELD_NOT_FOUND_ERROR,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourceExtractor: (error: any): string => {
      return error.message.substring(error.position, error.message.indexOf('"', error.position))
    },
  },
  {
    code: '23503',
    message: 'Reference not found',
    resCode: 404,
    detailCode: NotFoundErrorCodes.ENTITY_NOT_FOUND_ERROR,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourceExtractor: (error: any): string => {
      return error.constraint
    },
  },
]
