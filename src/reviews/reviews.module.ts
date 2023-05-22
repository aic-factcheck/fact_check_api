import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewSchema } from './schemas/review.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GameModule } from '../game/game.module';
import { Claim, ClaimSchema } from '../claims/schemas/claim.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Vote, VoteSchema } from '../vote/schemas/vote.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
    GameModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    ReviewsService,
  ],
})
export class ReviewsModule {}
