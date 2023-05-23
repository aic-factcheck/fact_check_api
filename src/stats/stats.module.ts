import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';
import { Claim, ClaimSchema } from '../claims/schemas/claim.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SavedArticle,
  SavedArticleSchema,
} from '../saved-articles/schemas/saved-article.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import {
  Reputation,
  ReputationSchema,
} from '../game/schemas/reputation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Reputation.name, schema: ReputationSchema },
    ]),
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
