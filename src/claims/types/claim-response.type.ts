import { Review } from '../../reviews/schemas/review.schema';
import { Claim } from '../schemas/claim.schema';

export type ClaimResponseType = Claim & {
  userReview: Review | null;
  nBeenVoted: number;
};
