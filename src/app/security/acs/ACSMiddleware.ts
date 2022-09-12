import { NextFunction, Request, Response } from 'express'
import * as HttpStatus from 'http-status-codes'
import { container } from 'tsyringe'

import { UserRole } from '../../common/UserRole'
import { ForbiddenErrorCodes } from '../../error/DetailErrorCodes'
import { ServerError } from '../../error/ServerError'
import { User } from '../../users/models/User'
import { UserSystemStatus } from '../../users/models/UserSystemStatus'
import { AuthService } from '../auth/services/AuthService'
import { ACS } from './models/ACS'
import { permissions } from './permission'

async function getUserFromToken(token: string, currentPermissions: Array<string>): Promise<User> {
  const authService = container.resolve<AuthService>('AuthService')
  const isAnon = !token && currentPermissions.some((el: string) => el in permissions.ANONYMOUS)
  const user = isAnon
    ? { uid: UserRole.ANONYMOUS, username: UserRole.ANONYMOUS, role: UserRole.ANONYMOUS }
    : await authService.validateAccessToken(token || '')
  return user
}

export const verifyAccess = (...currentPermissions: Array<string>) => async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let accessRules
  const { token } = req.cookies

  const user = await getUserFromToken(token, currentPermissions)

  if (user.systemStatus === UserSystemStatus.BANNED) {
    throw new ServerError('User banned', 403, ForbiddenErrorCodes.USER_BANNED, 'system-status')
  }

  req.user = user

  const availablePermissions: { [key: string]: (req: Request) => Promise<ACS> } =
    permissions[user.role]

  for (const permission of currentPermissions) {
    if (availablePermissions[permission]) {
      accessRules = await availablePermissions[permission](req)
      break
    }
  }

  if (!(accessRules && accessRules.hasAccess)) {
    throw new ServerError('Access denied', HttpStatus.FORBIDDEN)
  }

  req.accessRules = accessRules
  next()
}
