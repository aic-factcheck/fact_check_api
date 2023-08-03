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
  const reviewsMap = new Map(
    reviews.map((review) => [String(review.claim._id), review]),
  );

  const mergedClaims: ClaimResponseType[] = claims.map((claim) => {
    const userReview = reviewsMap.get(String(claim._id)) || null;
    return { ...claim.toObject(), userReview };
  });

  return mergedClaims;
}
