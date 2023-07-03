import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ArticleClaimReviewParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  @Transform(({ value }) => new Types.ObjectId(value))
  articleId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  @Type(() => Types.ObjectId)
  claimId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  @Type(() => Types.ObjectId)
  reviewId: Types.ObjectId;
}
