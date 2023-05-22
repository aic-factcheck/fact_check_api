import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './schemas/vote.schema';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';
import { Claim, ClaimSchema } from '../claims/schemas/claim.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GameModule,
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [
    MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
  ],
})
export class VoteModule {}
