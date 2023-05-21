/**
 * Sort options for hottes claims
 */
export enum SortByEnum {
  POSITIVE_VOTES_DESC = 'POSITIVE_VOTES_DESC',
  POSITIVE_VOTES_ASC = 'POSITIVE_VOTES_ASC',
  DATE_DESC = 'DATE_DESC',
  DATE_ASC = 'DATE_ASC',
  BOUNTY = 'BOUNTY',
}

export function getSortByObject(option: SortByEnum) {
  const sortByObj = {};
  switch (option as SortByEnum) {
    case SortByEnum.POSITIVE_VOTES_DESC:
      sortByObj['nPositiveVotes'] = 'desc';
      return sortByObj;
    case SortByEnum.POSITIVE_VOTES_ASC:
      sortByObj['nPositiveVotes'] = 'asc';
      return sortByObj;
    case SortByEnum.DATE_DESC:
      sortByObj['createdAt'] = 'desc';
      return sortByObj;
    case SortByEnum.DATE_ASC:
      sortByObj['createdAt'] = 'asc';
      return sortByObj;
    case SortByEnum.BOUNTY:
      sortByObj['bounty'] = 'desc';
      return sortByObj;
  }
}
