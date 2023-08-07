import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { GameModule } from '../game/game.module';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';
import { BackgroundArticleModule } from '../background-article/background-article.module';

@Module({
  imports: [SharedModelsModule, GameModule, BackgroundArticleModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
