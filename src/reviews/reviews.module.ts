import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewSchema } from './schemas/review.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
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
