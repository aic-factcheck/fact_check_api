import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../users/schemas/user.schema';
import { Article, ArticleSchema } from '../../articles/schemas/article.schema';
import { Claim, ClaimSchema } from '../../claims/schemas/claim.schema';
import { Review, ReviewSchema } from '../../reviews/schemas/review.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../auth/schemas/refresh-token.schema';
import {
  Reputation,
  ReputationSchema,
} from '../../game/schemas/reputation.schema';
import { Vote, VoteSchema } from '../../vote/schemas/vote.schema';
import {
  SavedArticle,
  SavedArticleSchema,
} from '../../saved-articles/schemas/saved-article.schema';
import { Report, ReportSchema } from '../../reports/schemas/report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },

      { name: Article.name, schema: ArticleSchema },
      { name: Claim.name, schema: ClaimSchema },
      { name: Review.name, schema: ReviewSchema },

      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: Reputation.name, schema: ReputationSchema },
      { name: Vote.name, schema: VoteSchema },

      { name: SavedArticle.name, schema: SavedArticleSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Reputation.name, schema: ReputationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SharedModelsModule {}
