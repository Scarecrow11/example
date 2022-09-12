export class EnumHelper {
  public static enumArrayToJSON<T>(enumValues: Array<T>): string {
    return JSON.stringify(enumValues)
  }

  public static parseEnumJSON<T>(enumJSON: string): T {
    return JSON.parse(enumJSON)
  }
}
