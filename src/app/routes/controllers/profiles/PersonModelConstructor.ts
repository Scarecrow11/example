import { Request } from 'express'

import { ModelConstructor } from '../../../common/ModelConstructor'
import { Person } from '../../../person/model/Person'

export class PersonModelConstructor implements ModelConstructor<Person, Person> {
  public constructRawForm(req: Request): Person {
    return this.constructPureObject(req)
  }

  public constructPureObject(req: Request): Person {
    const {
      avatar,
      firstName,
      middleName,
      lastName,
      jobTitle,
      legalName,
      shortName,
      tagline,
      phone,
      birthdayAt,
      username,
      gender,
      bio,
    } = req.body

    return {
      avatar,
      email: username,
      firstName,
      middleName,
      lastName,
      jobTitle,
      legalName,
      shortName,
      tagline,
      phone,
      birthdayAt,
      gender,
      bio,
    }
  }
}
