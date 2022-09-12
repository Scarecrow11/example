import { createHash } from 'crypto'

import { logger } from '../logger/LoggerFactory'
import { Profile } from '../profiles/models/Profile'
import { DateUtility } from './utils/DateUtility'

export class ConfirmationCodeUtility {
  public static createHashCode(
    value: string,
    date: string = DateUtility.now().toISOString(),
  ): string {
    return createHash('sha512')
      .update(value + date)
      .digest('hex')
  }

  public static createNumberCode(min = 100000, max = 999999): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  public static addEmailConfirmationCode(profile: Profile): Profile {
    const { username } = profile.user
    logger.debug(`confirmation.code.utility.add-email-confirmation-code.start.for:[${username}]`)

    const createdAt = DateUtility.now()

    const code = this.createHashCode(username, createdAt.toISOString())

    const newDetails = {
      ...profile.details,
      emailConfirmationCode: code,
      emailConfirmationCodeCreatedAt: createdAt,
    }

    const resultProfile: Profile = {
      user: profile.user,
      person: profile.person,
      details: Object.freeze(newDetails),
    }

    logger.debug(`confirmation.code.utility.add-email-confirmation-code.done.for:[${username}]`)
    return Object.freeze(resultProfile)
  }

  public static addPhoneConfirmationCode(profile: Profile): Profile {
    const { username } = profile.user
    logger.debug(`confirmation.code.utility.add-phone-confirmation-code.start.for:[${username}]`)

    const createdAt = DateUtility.now()

    const code = this.createNumberCode()

    const newDetails = {
      ...profile.details,
      phoneConfirmationCode: code,
      phoneConfirmationCodeCreatedAt: createdAt,
    }

    const resultProfile: Profile = {
      user: profile.user,
      person: profile.person,
      details: Object.freeze(newDetails),
    }

    logger.debug(`confirmation.code.utility.add-phone-confirmation-code.done.for:[${username}]`)
    return Object.freeze(resultProfile)
  }
}
