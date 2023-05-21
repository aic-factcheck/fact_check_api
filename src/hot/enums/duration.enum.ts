/**
 * Sort options for hottes claims
 */
export enum DurationLimitEnum {
  DAY = 'DAY',
  DAYS = 'DAYS',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export function getDurationQuery(option: DurationLimitEnum) {
  const date = new Date();
  switch (option as DurationLimitEnum) {
    case DurationLimitEnum.DAY:
      date.setDate(date.getDate() - 1);
      return { createdAt: { $gt: date.toISOString() } };
    case DurationLimitEnum.DAYS:
      date.setDate(date.getDate() - 3);
      return { createdAt: { $gt: date.toISOString() } };
    case DurationLimitEnum.WEEK:
      date.setDate(date.getDate() - 7);
      return { createdAt: { $gt: date.toISOString() } };
    case DurationLimitEnum.MONTH:
      date.setDate(date.getDate() - 30);
      return { createdAt: { $gt: date.toISOString() } };
    case DurationLimitEnum.YEAR:
      date.setDate(date.getDate() - 365);
      return { createdAt: { $gt: date.toISOString() } };
  }
}
