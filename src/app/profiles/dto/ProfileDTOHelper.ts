import { Gender } from '../../common/Gender'
import { logger } from '../../logger/LoggerFactory'
import { Person } from '../../person/model/Person'
import { User } from '../../users/models/User'
import { UserDetails } from '../../users/models/UserDetails'
import { Profile } from '../models/Profile'
import { ProfileDTO } from './ProfileDTO'
import { ProfileListDTO } from './ProfileListDTO'
import { ProfileTuple } from './ProfileTuple'

export class ProfileDTOHelper {
  public static constructSimpleDTOToProfile(dto: ProfileDTO): Profile {
    const user: User = {
      uid: dto.uid,
      role: dto.role,
      username: dto.username,
      password: '',
      systemStatus: dto.systemStatus,
    }

    const details: UserDetails = {
      emailConfirmed: dto.emailConfirmed,
      phoneConfirmed: dto.phoneConfirmed,
      language: dto.language,
    }

    const person: Person = {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      jobTitle: dto.jobTitle,
      legalName: dto.legalName,
      shortName: dto.shortName,
      email: dto.email,
      phone: dto.phone,
      birthdayAt: dto.birthdayAt,
      gender: dto.gender as Gender,
      bio: dto.bio,
      avatar: dto.avatar,
    }

    const prof: Profile = {
      user: Object.freeze(user),
      details: Object.freeze(details),
      person: Object.freeze(person),
    }

    logger.debug('profile.dto.simple-to-profile.done')
    return Object.freeze(prof)
  }

  private static constructArrayToProfiles(dto: ProfileTuple): ProfileListDTO {
    const user: User = {
      role: dto.role,
      username: dto.username,
      createdAt: dto.createdAt,
      password: '',
    }

    const person: Person = {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      jobTitle: dto.jobTitle,
      legalName: dto.legalName,
      shortName: dto.shortName,
      email: dto.email,
      phone: dto.phone,
      birthdayAt: dto.birthdayAt,
    }

    const prof: ProfileListDTO = {
      user: Object.freeze(user),
      person: Object.freeze(person),
    }
    return Object.freeze(prof)
  }

  public static multipliesProfiles(dto: Array<ProfileTuple>): Array<ProfileListDTO> {
    logger.debug('profile.dto.multiplies.done')
    return dto.map(el => this.constructArrayToProfiles(el))
  }
}
