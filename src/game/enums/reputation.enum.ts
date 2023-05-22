/**
 * Reason why reputation was added
 */
export enum ReputationEnum {
  REGISTER = 'REGISTER',
  DAILY_LOGIN = 'DAILY_LOGIN',
  CREATE_ARTICLE = 'CREATE_ARTICLE',
  CREATE_CLAIM = 'CREATE_CLAIM',
  CREATE_REVIEW = 'CREATE_REVIEW',
  APPEAR_TOP = 'APPEAR_TOP',
  INVITE = 'INVITE',
  SHARE = 'SHARE',
  VOTE = 'VOTE',
  CREATE_COMMUNITY = 'CREATE_COMMUNITY',
  JOIN_COMMUNITY = 'JOIN_COMMUNITY',
}

export function getScoreFor(option: ReputationEnum): number {
  switch (option as ReputationEnum) {
    case ReputationEnum.REGISTER:
      return 0;
    case ReputationEnum.DAILY_LOGIN:
      return 0;
    case ReputationEnum.CREATE_ARTICLE:
      return 8;
    case ReputationEnum.CREATE_CLAIM:
      return 20;
    case ReputationEnum.CREATE_REVIEW:
      return 30;
    case ReputationEnum.APPEAR_TOP:
      return 10;
    case ReputationEnum.INVITE:
      return 30;
    case ReputationEnum.SHARE:
      return 15;
    case ReputationEnum.VOTE:
      return 3;
    case ReputationEnum.CREATE_COMMUNITY:
      return 100;
    case ReputationEnum.JOIN_COMMUNITY:
      return 10;
  }
}
