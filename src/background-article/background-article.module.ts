import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackgroundArticleService } from './background-article.service';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';
import { BG_ARTICLE_QUEUE_NAME } from './background-article.constants';
import { BullModule } from '@nestjs/bull';
import { BgArticleQueueProcessor } from './background-article.processor';

@Module({
  imports: [
    ConfigModule,
    SharedModelsModule,
    BullModule.registerQueue({
      name: BG_ARTICLE_QUEUE_NAME,
      limiter: {
        max: 5, // Max number of jobs processed
        duration: 1000, // per duration in milliseconds
      },
    }),
  ],
  providers: [BackgroundArticleService, BgArticleQueueProcessor],
  exports: [BackgroundArticleService],
})
export class BackgroundArticleModule {}
