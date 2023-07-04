import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ArticleClaimReviewParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  articleId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  claimId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  reviewId: Types.ObjectId;
}
