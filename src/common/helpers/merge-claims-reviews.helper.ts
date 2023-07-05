import { _ } from 'lodash';
import { ClaimDocument } from '../../claims/schemas/claim.schema';
import { ClaimResponseType } from '../../claims/types/claim-response.type';
import { ReviewDocument } from '../../reviews/schemas/review.schema';

/*
 * Takes `claims` array and logged user array of `reviews`
 * returns new array of merged claims with user's review for each claim
 */
export async function mergeClaimsWithReviews(
  claims: ClaimDocument[],
  reviews: ReviewDocument[],
): Promise<ClaimResponseType[]> {
  const mergedClaims: ClaimResponseType[] = claims.map((claim) => {
    let userReview = null;
    userReview = _.find(reviews, { claim: claim._id });
    return {
      ...claim.toObject(),
      userReview,
    } as ClaimResponseType;
  });

  return mergedClaims;
}
