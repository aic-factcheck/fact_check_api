import { NullableType } from 'src/common/types/nullable.type';
import { Vote } from '../../vote/schemas/vote.schema';
import { Review } from '../schemas/review.schema';

export type ReviewResponseType = Review & {
  userVote: NullableType<Vote>;
  nBeenVoted: number;
};
