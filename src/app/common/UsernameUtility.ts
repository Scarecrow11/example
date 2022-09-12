export enum SocialUsernameTypes {
  facebook = 'facebook',
  google = 'google',
}

export class UsernameUtility {
  public static isFacebookUsername(username: string): boolean {
    return username.endsWith(`@${SocialUsernameTypes.facebook}`)
  }

  public static createFacebookUsername(facebookID: string): string {
    return `${facebookID}@${SocialUsernameTypes.facebook}`
  }

  public static isGoogleUsername(username: string): boolean {
    return username.endsWith(`@${SocialUsernameTypes.google}`)
  }

  public static createGoogleUsername(googleID: string): string {
    return `${googleID}@${SocialUsernameTypes.google}`
  }

  public static isSocialUsernameType(username: string): boolean {
    return (
      UsernameUtility.isFacebookUsername(username) || UsernameUtility.isGoogleUsername(username)
    )
  }
}
