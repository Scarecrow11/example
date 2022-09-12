import { Request } from 'express'

import { User } from '../../users/models/User'
import { ACS } from './models/ACS'
import { AccessDeniedACS, EditOwnObjectACS, GrandAccessACS } from './strategies'

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */

export const permissions = {
  ADMINISTRATOR: {
    moderation: grandAccess,
    user_profiles: grandAccess,
    own_profile: editOwnObject,
    save_image: grandAccess,
  },
  MODERATOR: {
    moderation: editOwnObject,
    own_profile: editOwnObject,
    save_image: editOwnImage,
  },
  JOURNALIST: {
    own_profile: editOwnObject,
    save_image: editOwnImage,
  },
  PRIVATE: {
    own_profile: editOwnObject,
    save_image: editOwnImage,
  },
  LEGAL: {
    own_profile: editOwnObject,
    save_image: editOwnImage,
  },
  ANONYMOUS: {
  },
  DELETED: {},
}

async function editOwnObject(req: Request): Promise<ACS> {
  const user = req.user as User

  return new EditOwnObjectACS(user.uid as string)
}

async function editOwnImage(req: Request): Promise<ACS> {
  const user = req.user as User

  if (req.query.email) {
    return new AccessDeniedACS()
  }

  return new EditOwnObjectACS(user.uid as string)
}

async function grandAccess(): Promise<ACS> {
  return new GrandAccessACS()
}


