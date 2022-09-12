import { Request } from 'express'

import { Gender } from '../../../common/Gender'
import { ModelConstructor } from '../../../common/ModelConstructor'
import { UsernameUtility } from '../../../common/UsernameUtility'
import { UserRole } from '../../../common/UserRole'
import { DateUtility } from '../../../common/utils/DateUtility'
import { Person } from '../../../person/model/Person'
import { Profile } from '../../../profiles/models/Profile'
import { FacebookData } from '../../../security/auth/models/FacebookData'
import { User } from '../../../users/models/User'
import { UserDetails } from '../../../users/models/UserDetails'
import { PersonModelConstructor } from './PersonModelConstructor'
import { UserDetailsAdminModelConstructor } from './UserDetailsAdminModelConstructor'

export class ProfileModelConstructor implements ModelConstructor<Profile, Profile> {

  private static parseGender(gender: string | undefined): Gender {
    if (gender) {
      const genderValue = Gender[gender.toUpperCase() as 'MALE' | 'FEMALE']
      return genderValue || Gender.UNSET
    }

    return Gender.UNSET
  }

  private person = new PersonModelConstructor()
  private userDetails = new UserDetailsAdminModelConstructor()

  private constructNewUserObject(req: Request): User {
    const { password, role, username } = req.body

    return {
      username: username,
      password,
      role,
    }
  }

  public constructRawForm(req: Request): Profile {
    const user = this.constructNewUserObject(req)
    const person = this.person.constructPureObject(req)
    const details = this.userDetails.constructPureObject(req)

    return { user, person, details }
  }

  public constructUserRegistrationProfile(req: Request): Profile {
    const user = this.constructNewUserObject(req)
    const person = this.person.constructPureObject(req)
    const email = person.email || req.body.username
    const details = { new: true, ...this.userDetails.constructPureObject(req) }
    return { user, person: { ...person, email }, details }
  }

  public constructGoogleProfile(email: string, googleId: string, emailVerified: boolean): Profile {
    const user: User = {
      username: UsernameUtility.createGoogleUsername(googleId),
      lastLoginAt: DateUtility.now(),
      role: UserRole.PRIVATE,
    }
    const person: Person = { email }

    const details: UserDetails = { googleId, new: true, emailConfirmed: emailVerified }
    return { user, person, details }
  }

  public constructFacebookProfile(fbBody: FacebookData): Profile {
    const user: User = {
      username: UsernameUtility.createFacebookUsername(fbBody.id),
      lastLoginAt: DateUtility.now(),
      role: UserRole.PRIVATE,
    }

    const birthday = (fbBody.birthday && new Date(fbBody.birthday)) || undefined

    const person: Person = {
      email: fbBody.email,
      firstName: fbBody.first_name,
      lastName: fbBody.last_name,
      birthdayAt: birthday,
      gender: ProfileModelConstructor.parseGender(fbBody.gender),
    }
    const details: UserDetails = { facebookId: fbBody.id, new: true, emailConfirmed: true }
    return { user, person, details }
  }

  public constructPureObject(req: Request): Profile {
    return this.constructRawForm(req)
  }
}
