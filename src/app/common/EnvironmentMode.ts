import 'dotenv/config'

export enum EnvironmentMode {
  TEST = 'test',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export namespace EnvironmentMode {
  export function isTest(): boolean {
    return process.env.NODE_ENV === EnvironmentMode.TEST
  }

  export function isProduction(): boolean {
    return process.env.NODE_ENV === EnvironmentMode.PRODUCTION
  }

  export function isDevelopment(): boolean {
    return !isTest() && !isProduction()
  }

  export function getSimpleName(): string {
    if (isTest()) {
      return EnvironmentMode.TEST
    } else if (isProduction()) {
      return EnvironmentMode.PRODUCTION
    } else {
      return EnvironmentMode.DEVELOPMENT
    }
  }
}
