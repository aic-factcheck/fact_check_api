import { User } from '../../users/schemas/user.schema';

export type UserStatType = User & {
  nArticles: number;
  nClaims: number;
};
