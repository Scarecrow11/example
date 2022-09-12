import { Request, Response, Router } from 'express'
import { inject, injectable } from 'tsyringe'

import { validate } from '../../../common/validators/ValidationMiddleware'
import { NotFoundErrorCodes, ValidationErrorCodes } from '../../../error/DetailErrorCodes'
import { ServerError } from '../../../error/ServerError'
import { ConstructFrom } from '../../../generic/model/ConstructSingleFieldObject'
import { FilterValidator } from '../../../generic/validator/FilterValidator'
import { logger } from '../../../logger/LoggerFactory'
import { PersonValidator } from '../../../person/validator/PersonValidator'
import { ProfileService } from '../../../profiles/services/ProfileService'
import { ProfileValidator } from '../../../profiles/validator/ProfileValidator'
import { UpdateProfileEmailValidator } from '../../../profiles/validator/UpdateProfileEmailValidator'
import { UpdateProfilePasswordValidator } from '../../../profiles/validator/UpdateProfilePasswordValidator'
import { UpdateProfilePhoneValidator } from '../../../profiles/validator/UpdateProfilePhoneValidator'
import { verifyAccess } from '../../../security/acs/ACSMiddleware'
import { EditOwnObjectACS, GrandAccessACS } from '../../../security/acs/strategies'
import { AuthService } from '../../../security/auth/services/AuthService'
import { User } from '../../../users/models/User'
import { UserDetailsService } from '../../../users/services/UserDetailsService'
import { UserService } from '../../../users/services/UserService'
import { UserDetailsValidator } from '../../../users/validator/UserDetailsValidator'
import { Controller } from '../Controller'
import { FilterModelConstructor } from '../FilterModelConstructor'
import { PersonModelConstructor } from './PersonModelConstructor'
import { ProfileModelConstructor } from './ProfileModelConstructor'
import { UpdateProfileEmailModelConstructor } from './UpdateProfileEmailModelConstructor'
import { UpdateProfilePasswordModelConstructor } from './UpdateProfilePasswordConstructor'
import { UpdateProfilePhoneModelConstructor } from './UpdateProfilePhoneModelConstructor'
import { UserDetailsAdminModelConstructor } from './UserDetailsAdminModelConstructor'

@injectable()
export class ProfileController implements Controller {
  private modelConstructor: ProfileModelConstructor = new ProfileModelConstructor()
  private validator: ProfileValidator = new ProfileValidator()
  private filterConstructor: FilterModelConstructor = new FilterModelConstructor()

  private updateProfileEmailModelConstructor: UpdateProfileEmailModelConstructor = new UpdateProfileEmailModelConstructor()
  private updateProfileEmailValidator: UpdateProfileEmailValidator = new UpdateProfileEmailValidator()

  private updateProfilePhoneModelConstructor: UpdateProfilePhoneModelConstructor = new UpdateProfilePhoneModelConstructor()
  private updateProfilePhoneValidator: UpdateProfilePhoneValidator = new UpdateProfilePhoneValidator()

  private filterValidator: FilterValidator = new FilterValidator()
  private personValidator: PersonValidator = new PersonValidator()
  private personModelConstructor: PersonModelConstructor = new PersonModelConstructor()

  private userDetailsValidator: UserDetailsValidator = new UserDetailsValidator()
  private userDetailsAdminModelConstructor: UserDetailsAdminModelConstructor = new UserDetailsAdminModelConstructor()

  private passwordUpdateValidator: UpdateProfilePasswordValidator = new UpdateProfilePasswordValidator()
  private passwordUpdateConstructor: UpdateProfilePasswordModelConstructor = new UpdateProfilePasswordModelConstructor(
    ConstructFrom.PARAMS,
  )

  constructor(
    @inject('ProfileService') private profileService: ProfileService,
    @inject('AuthService') private authService: AuthService,
    @inject('UserService') private userService: UserService,
    @inject('UserDetailsService') private userDetailsService: UserDetailsService,
  ) {}

  public path(): string {
    return '/user-profile/profiles'
  }

  public initialize(router: Router): void {
    router.get(
      '/',
      verifyAccess('user_profiles'),
      validate(this.filterConstructor, this.filterValidator),
      this.list,
    )

    router.post(
      '/',
      verifyAccess('user_profiles'),
      validate(this.modelConstructor, this.validator),
      this.createProfile,
    )

    router.get('/:email', verifyAccess('user_profiles'), this.loadProfile)
    router.delete('/:username', verifyAccess('user_profiles'), this.deleteProfile)
    router.put(
      '/:username/person',
      verifyAccess('user_profiles'),
      validate(this.personModelConstructor, this.personValidator),
      this.updatePerson,
    )
    router.put(
      '/:username/user-details',
      verifyAccess('user_profiles'),
      validate(this.userDetailsAdminModelConstructor, this.userDetailsValidator),
      this.updateDetails,
    )
    router.put(
      '/:username/email',
      verifyAccess('user_profiles'),
      validate(this.updateProfileEmailModelConstructor, this.updateProfileEmailValidator),
      this.updateEmail,
    )
    router.put(
      '/:username/phone',
      verifyAccess('user_profiles'),
      validate(this.updateProfilePhoneModelConstructor, this.updateProfilePhoneValidator),
      this.updatePhone,
    )
    router.put(
      '/:username/password',
      verifyAccess('user_profiles'),
      validate(this.passwordUpdateConstructor, this.passwordUpdateValidator),
      this.updatePassword,
    )
    router.put(
      '/unlink-facebook/:email',
      verifyAccess('unlink_social_network'),
      this.unlinkFacebook,
    )
    router.put('/unlink-google/:email', verifyAccess('unlink_social_network'), this.unlinkGoogle)
  }

  public list = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.list.start')
    const meta = this.filterConstructor.constructPureObject(request)

    const users = await this.profileService.list(meta, new GrandAccessACS())
    response.json(users)
    logger.debug('profile.controller.list.done')
  }

  public loadProfile = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.load.start')
    const profile = await this.profileService.get(request.params.email, request.accessRules)

    if (!profile) {
      logger.error('profile.controller.load.not-found')
      throw new ServerError(
        'User profile with the specified email cannot be found',
        404,
        NotFoundErrorCodes.ENTITY_NOT_FOUND_ERROR,
        'profile',
      )
    }

    response.json(profile)
    logger.debug('profile.controller.load.done')
  }

  public createProfile = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.create-profile.start')
    const profile = this.modelConstructor.constructUserRegistrationProfile(request)

    const { language } = request.query

    await this.profileService.create(profile, request.accessRules, language, true)

    response.status(201).send()
    logger.debug('profile.controller.create-profile.done')
  }

  public updatePerson = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-person.start')
    const username = request.params.username
    const person = this.personModelConstructor.constructPureObject(request)
    const user = request.user as User

    await this.profileService.updatePersonByUsername(
      username,
      person,
      request.accessRules,
      user.uid,
    )

    response.status(204).send()
    logger.debug('profile.controller.update-person.done')
  }

  public updateDetails = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-details.start')
    const details = this.userDetailsAdminModelConstructor.constructPureObject(request)
    const username = request.params.username

    await this.userDetailsService.updateByUsername(details, username, request.accessRules)

    response.status(204).send()
    logger.debug('profile.controller.update-details.done')
  }

  public deleteProfile = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.delete.start')
    const username = request.params.username
    await this.profileService.deleteProfile(username, request.accessRules)
    response.status(204).send()
    logger.debug('profile.controller.delete.done')
  }

  public updateEmail = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-email.start')
    const {
      email,
      password,
      username,
      language,
    } = this.updateProfileEmailModelConstructor.constructPureObject(request)
    const adminUser = request.user as User
    const user = await this.userService.findUser(username)

    await this.authService.verifyUsernamePassword(
      adminUser.username,
      password,
      adminUser,
      'update-email',
    )

    if (!user || !user.uid) {
      throw new ServerError(
        'Unexpected error, dont got full user data',
        500,
        ValidationErrorCodes.UNKNOWN_VALIDATION_ERROR,
        'profile',
      )
    }
    const profile = await this.profileService.getMyProfile(user.uid)
    const userACS = new EditOwnObjectACS(user.uid)
    await this.profileService.updateOwnEmail(profile, email, userACS, language)

    response.status(202).send()
    logger.debug('profile.controller.update-email.done')
  }

  public updatePhone = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-phone.start')
    const {
      phone,
      password,
      username,
    } = this.updateProfilePhoneModelConstructor.constructPureObject(request)

    const user = await this.userService.findUser(username)
    await this.authService.verifyUsernamePassword(username, password, user, 'update-phone')

    const profile = await this.profileService.getMyProfile(request.user?.uid)

    await this.profileService.updateOwnPhone(profile, phone, request.accessRules)

    response.status(202).send()
    logger.debug('profile.controller.update-phone.done')
  }

  public updatePassword = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-password-by-admin.start')
    const admin = request.user as User
    const { username, password, newPassword } = this.passwordUpdateConstructor.constructPureObject(
      request,
    )

    await this.authService.verifyUsernamePassword(
      admin.username,
      password,
      admin,
      'update-password',
    )

    await this.profileService.updatePassword(username, newPassword, request.accessRules)
    response.status(202).send()
    logger.debug('profile.controller.update-password-by-admin.done')
  }



}
