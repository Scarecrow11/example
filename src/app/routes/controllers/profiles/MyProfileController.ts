import { Request, Response, Router } from 'express'
import { inject, injectable } from 'tsyringe'

import { Language } from '../../../common/Language'
import { validate } from '../../../common/validators/ValidationMiddleware'
import { NotFoundErrorCodes } from '../../../error/DetailErrorCodes'
import { ServerError } from '../../../error/ServerError'
import { ConstructFrom } from '../../../generic/model/ConstructSingleFieldObject'
import { SingleFieldObjectConstructor } from '../../../generic/utils/SingleFieldObjectConstructor'
import { logger } from '../../../logger/LoggerFactory'
import { PersonService } from '../../../person/service/PersonService'
import { PersonValidator } from '../../../person/validator/PersonValidator'
import { ProfileService } from '../../../profiles/services/ProfileService'
import { ResetPasswordFormValidator } from '../../../profiles/validator/ResetPasswordFormValidator'
import { SetNewPasswordFormValidator } from '../../../profiles/validator/SetNewPasswordFormValidator'
import { UpdateProfileEmailValidator } from '../../../profiles/validator/UpdateProfileEmailValidator'
import { UpdateProfilePasswordValidator } from '../../../profiles/validator/UpdateProfilePasswordValidator'
import { UpdateProfilePhoneValidator } from '../../../profiles/validator/UpdateProfilePhoneValidator'
import { verifyAccess } from '../../../security/acs/ACSMiddleware'
import { AuthService } from '../../../security/auth/services/AuthService'
import { User } from '../../../users/models/User'
import { UserDetailsService } from '../../../users/services/UserDetailsService'
import { UserService } from '../../../users/services/UserService'
import { PhoneCodeValidator } from '../../../users/validator/PhoneCodeValidator'
import { UserDetailsValidator } from '../../../users/validator/UserDetailsValidator'
import { UserLanguageValidator } from '../../../users/validator/UserLanguageValidator'
import { Controller } from '../Controller'
import { PersonModelConstructor } from './PersonModelConstructor'
import { SetNewPasswordFormModelConstructor } from './SetNewPasswordFormConstructor'
import { UpdateProfileEmailModelConstructor } from './UpdateProfileEmailModelConstructor'
import { UpdateProfilePasswordModelConstructor } from './UpdateProfilePasswordConstructor'
import { UpdateProfilePhoneModelConstructor } from './UpdateProfilePhoneModelConstructor'
import { UserDetailsModelConstructor } from './UserDetailsModelConstructor'

@injectable()
export class MyProfileController implements Controller {
  private personValidator: PersonValidator = new PersonValidator()
  private personModelConstructor: PersonModelConstructor = new PersonModelConstructor()

  private updateProfileEmailValidator: UpdateProfileEmailValidator = new UpdateProfileEmailValidator()
  private updateProfileEmailModelConstructor: UpdateProfileEmailModelConstructor = new UpdateProfileEmailModelConstructor(
    ConstructFrom.USER,
  )

  private updateUserLanguageConstructor: SingleFieldObjectConstructor = new SingleFieldObjectConstructor(
    'language',
    ConstructFrom.PARAMS,
  )
  private updateUserLanguageValidator: UserLanguageValidator = new UserLanguageValidator()

  private userDetailsValidator: UserDetailsValidator = new UserDetailsValidator()
  private userDetailsModelConstructor: UserDetailsModelConstructor = new UserDetailsModelConstructor()
  private phoneCodeValidator: PhoneCodeValidator = new PhoneCodeValidator()
  private phoneCodeConstructor: SingleFieldObjectConstructor = new SingleFieldObjectConstructor(
    'phoneConfirmationCode',
    ConstructFrom.PARAMS,
  )

  private updateProfilePhoneValidator: UpdateProfilePhoneValidator = new UpdateProfilePhoneValidator()
  private updateProfilePhoneModelConstructor: UpdateProfilePhoneModelConstructor = new UpdateProfilePhoneModelConstructor(
    ConstructFrom.USER,
  )

  private passwordUpdateValidator: UpdateProfilePasswordValidator = new UpdateProfilePasswordValidator()
  private passwordUpdateConstructor: UpdateProfilePasswordModelConstructor = new UpdateProfilePasswordModelConstructor(
    ConstructFrom.USER,
  )

  private resetPasswordFormValidator: ResetPasswordFormValidator = new ResetPasswordFormValidator()
  private resetPasswordFormConstructor: SingleFieldObjectConstructor = new SingleFieldObjectConstructor(
    'email',
    ConstructFrom.BODY,
  )

  private setNewPasswordFormValidator: SetNewPasswordFormValidator = new SetNewPasswordFormValidator()
  private setNewPasswordFormConstructor: SetNewPasswordFormModelConstructor = new SetNewPasswordFormModelConstructor()

  constructor(
    @inject('ProfileService') private profileService: ProfileService,
    @inject('AuthService') private authService: AuthService,
    @inject('UserService') private userService: UserService,
    @inject('PersonService') private personService: PersonService,
    @inject('UserDetailsService') private userDetailsService: UserDetailsService,
  ) {}

  public path(): string {
    return '/user-profile/my-profile'
  }

  public initialize(router: Router): void {
    router.put(
      '/person',
      verifyAccess('own_profile'),
      validate(this.personModelConstructor, this.personValidator),
      this.updatePerson,
    )
    router.put(
      '/user-details',
      verifyAccess('own_profile'),
      validate(this.userDetailsModelConstructor, this.userDetailsValidator),
      this.updateDetails,
    )

    router.put(
      '/user-language/:language',
      verifyAccess('own_profile'),
      validate(this.updateUserLanguageConstructor, this.updateUserLanguageValidator),
      this.updateUserLanguage,
    )

    router.put(
      '/phone',
      verifyAccess('own_profile'),
      validate(this.updateProfilePhoneModelConstructor, this.updateProfilePhoneValidator),
      this.updatePhone,
    )
    router.post(
      '/phone-confirmation/:phoneConfirmationCode',
      verifyAccess('own_profile'),
      validate(this.phoneCodeConstructor, this.phoneCodeValidator),
      this.confirmPhone,
    )
    router.put(
      '/email',
      verifyAccess('own_profile'),
      validate(this.updateProfileEmailModelConstructor, this.updateProfileEmailValidator),
      this.updateEmail,
    )
    router.get('/email-confirmation/:userEmailConfirmationCode', this.confirmEmail)
    router.put(
      '/password',
      verifyAccess('own_profile'),
      validate(this.passwordUpdateConstructor, this.passwordUpdateValidator),
      this.updatePassword,
    )
    router.post(
      '/reset-password',
      validate(this.resetPasswordFormConstructor, this.resetPasswordFormValidator),
      this.resetPassword,
    )
    router.post(
      '/set-new-password',
      validate(this.setNewPasswordFormConstructor, this.setNewPasswordFormValidator),
      this.setNewPassword,
    )
    router.delete('/', verifyAccess(), this.deleteProfile)
  }

  public updatePerson = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-person.start')
    const username = request.user && request.user.username
    const userUid = request.user && request.user.uid
    const person = this.personModelConstructor.constructPureObject(request)

    await this.profileService.updatePersonByUsername(username, person, request.accessRules, userUid)

    response.status(204).send()
    logger.debug('profile.controller.update-person.done')
  }

  public updateDetails = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-details.start')
    const details = this.userDetailsModelConstructor.constructPureObject(request)
    const username = request.user && request.user.username

    await this.userDetailsService.updateByUsername(details, username, request.accessRules)

    response.status(204).send()
    logger.debug('profile.controller.update-details.done')
  }

  public updateEmail = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-email.start')
    const {
      email,
      password,
      username,
      language,
    } = this.updateProfileEmailModelConstructor.constructPureObject(request)

    const user = await this.userService.findUser(username)
    await this.authService.verifyUsernamePassword(username, password, user, 'update-own-email')

    const profile = await this.profileService.getMyProfile(request.user && request.user.uid)

    await this.profileService.updateOwnEmail(profile, email, request.accessRules, language)

    response.status(202).send()
    logger.debug('profile.controller.update-email.done')
  }

  public updatePhone = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-phone.start')
    const { phone } = this.updateProfilePhoneModelConstructor.constructPureObject(request)

    const profile = await this.profileService.getMyProfile(request.user?.uid)
    await this.profileService.updateOwnPhone(profile, phone, request.accessRules)

    response.status(202).send()
    logger.debug('profile.controller.update-phone.done')
  }

  public updatePassword = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-password.start')
    const user = request.user as User
    const { username, password, newPassword } = this.passwordUpdateConstructor.constructPureObject(
      request,
    )

    await this.authService.verifyUsernamePassword(username, password, user, 'update-password')

    await this.profileService.updatePassword(username, newPassword, request.accessRules)
    response.status(202).send()
    logger.debug('profile.controller.update-password.done')
  }

  public resetPassword = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.init-password-resetting.start')
    const email = request.body.email

    const person = await this.personService.getByEmail(email)
    if (!person) {
      throw new ServerError(
        `User is not found`,
        404,
        NotFoundErrorCodes.ENTITY_NOT_FOUND_ERROR,
        'my-profile',
      )
    }

    await this.profileService.resetPassword(email)
    response.status(200).send()
    logger.debug('profile.controller.init-password-resetting.done')
  }

  public setNewPassword = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.init-password-resetting.start')
    const { passwordRestorationCode, newPassword } = request.body

    await this.profileService.setNewPassword(passwordRestorationCode, newPassword)

    response.status(202).send()
    logger.debug('profile.controller.init-password-resetting.done')
  }

  public confirmPhone = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.confirm-phone.start')
    const code = +request.params.phoneConfirmationCode
    const { username } = request.user as User

    await this.profileService.confirmPhone(username, code, request.accessRules)
    response.status(200).send()
    logger.debug('profile.controller.confirm-phone.done')
  }

  public confirmEmail = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.confirm-email.start')
    const code: string = request.params.userEmailConfirmationCode
    let redirectURL = process.env.EMAIL_CONFIRMATION_REDIRECT_URL || '/'

    try {
      await this.profileService.confirmEmail(code)
    } catch (error) {
      logger.debug('profile.controller.confirm-email.error')
      redirectURL = process.env.EMAIL_CONFIRMATION_REDIRECT_EXPIRED_URL || '/'
    }
    response.redirect(redirectURL)
    logger.debug('profile.controller.confirm-email.done')
  }

  public deleteProfile = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.delete.start')
    const username = request.user && request.user.username
    await this.profileService.deleteProfile(username, request.accessRules)
    response.status(204).send()
    logger.debug('profile.controller.delete.done')
  }

  public updateUserLanguage = async (request: Request, response: Response): Promise<void> => {
    logger.debug('profile.controller.update-details.start')
    const language = request.params.language as Language
    const username = request.user && request.user.username

    await this.userDetailsService.updateUserLanguageByUsername(
      language,
      username,
      request.accessRules,
    )

    response.status(204).send()
    logger.debug('profile.controller.update-details.done')
  }
}
