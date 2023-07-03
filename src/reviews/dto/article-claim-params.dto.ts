import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ArticleClaimParamsDto {
  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  @Type(() => Types.ObjectId)
  @IsMongoId()
  articleId: Types.ObjectId;

  @IsNotEmpty()
  @Transform(({ value }) => new Types.ObjectId(value))
  @Type(() => Types.ObjectId)
  @IsMongoId()
  claimId: Types.ObjectId;
}
