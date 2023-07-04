import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ArticleClaimParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  articleId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  claimId: Types.ObjectId;
}
