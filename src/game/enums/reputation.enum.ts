/**
 * Reason why reputation was added
 */
export enum GameAtionEnum {
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

export function getRepForAction(option: GameAtionEnum): number {
  switch (option as GameAtionEnum) {
    case GameAtionEnum.REGISTER:
      return 0;
    case GameAtionEnum.DAILY_LOGIN:
      return 0;
    case GameAtionEnum.CREATE_ARTICLE:
      return 8;
    case GameAtionEnum.CREATE_CLAIM:
      return 20;
    case GameAtionEnum.CREATE_REVIEW:
      return 30;
    case GameAtionEnum.APPEAR_TOP:
      return 10;
    case GameAtionEnum.INVITE:
      return 30;
    case GameAtionEnum.SHARE:
      return 15;
    case GameAtionEnum.VOTE:
      return 3;
    case GameAtionEnum.CREATE_COMMUNITY:
      return 100;
    case GameAtionEnum.JOIN_COMMUNITY:
      return 10;
  }
}
