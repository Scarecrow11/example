import { DateTime, DurationObjectUnits, DurationUnit } from 'luxon'

export class DateUtility {
  public static now(): Date {
    return DateTime.local()
      .toUTC()
      .toJSDate()
  }

  public static today(): Date {
    return DateTime.fromJSDate(this.now())
      .toUTC()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toJSDate()
  }

  public static subtractDays(days = 1, from = this.now()): Date {
    return DateTime.fromJSDate(from)
      .minus({ days: days })
      .toUTC()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toJSDate()
  }

  public static getNextDay(from = this.now()): Date {
    return DateTime.fromJSDate(from)
      .plus({ days: 1 })
      .toUTC()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toJSDate()
  }

  public static getNextMonth(from = this.now()): Date {
    return DateTime.fromJSDate(from)
      .plus({ month: 1 })
      .toUTC()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toJSDate()
  }

  public static fromISO(dateISO: string): Date {
    return DateTime.fromISO(dateISO)
      .toUTC()
      .toJSDate()
  }

  public static getDateDiff(
    start: Date,
    end: Date,
    durationUnit: Array<DurationUnit>,
  ): DurationObjectUnits {
    return DateTime.fromJSDate(end)
      .toUTC()
      .diff(DateTime.fromJSDate(start).toUTC(), durationUnit)
      .toObject()
  }
}
